import React, { useContext, useEffect, useRef, useState } from 'react'
import {
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import {
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native-gesture-handler'
import { ConfigContext } from '../../common/provider/ConfigProvider'
import * as Resources from '../../common/Resources'
import ThrottleButton from '../../component/ThrottleButton'
import BtnBackBlur from '../../component/BtnBackBlur'
import { parseImportKey } from '../../hooks/useRawKey'

export const RecoverPrivateKeyView = (props: {
  navigation: any
  route: any
}) => {
  const { translations } = useContext(ConfigContext)
  const safeInsetTop = Resources.getSafeLayoutInsets().top
  const safeInsetBottom = Resources.getSafeLayoutInsets().bottom
  const [isKeyboardShow, setKeyboardShow] = useState(false)

  const bottomMargin = useRef(new Animated.Value(safeInsetBottom + 40)).current
  const animDuration = 200
  const startDownAnim = () => {
    Animated.parallel([
      Animated.timing(bottomMargin, {
        toValue: safeInsetBottom + 40,
        duration: animDuration,
        delay: 0,
        useNativeDriver: false,
      }),
    ]).start()
  }

  const startUpAnim = () => {
    Animated.parallel([
      Animated.timing(bottomMargin, {
        toValue: 0,
        duration: animDuration,
        delay: 0,
        useNativeDriver: false,
      }),
    ]).start()
  }

  useEffect(() => {
    const show = () => {
      setKeyboardShow(true)
      startUpAnim()
    }
    Keyboard.addListener('keyboardWillShow', show)
    Keyboard.addListener('keyboardDidShow', show)
    return () => {
      Keyboard.removeListener('keyboardWillShow', show)
      Keyboard.removeListener('keyboardDidShow', show)
    }
  }, [])

  useEffect(() => {
    const hide = () => {
      setKeyboardShow(false)
      startDownAnim()
    }
    Keyboard.addListener('keyboardWillHide', hide)
    Keyboard.addListener('keyboardDidHide', hide)
    return () => {
      Keyboard.removeListener('keyboardWillHide', hide)
      Keyboard.removeListener('keyboardDidHide', hide)
    }
  }, [])

  const hideKeyboard = () => {
    Keyboard.dismiss()
  }

  const [confirmEnable, setConfirmEnable] = useState(false)
  const [encodePrivateKey, setEncodePrivateKey] = useState('')
  const [encryptPrivateKey, setEncryptPrivateKey] = useState('')

  useEffect(() => {
    if (encodePrivateKey) {
      parseImportKey(encodePrivateKey).then((decodeBuffer) => {
        if (decodeBuffer !== undefined) {
          setEncryptPrivateKey(decodeBuffer.encrypted_key)
          setConfirmEnable(true)
        } else {
          setConfirmEnable(false)
        }
      })
    }
  }, [encodePrivateKey])

  const onNext = () => {
    hideKeyboard()
    setTimeout(async () => {
      try {
        props.navigation.replace('RecoverPasswordView', {
          encryptPrivateKey,
        })
      } finally {
      }
    })
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={[styles.container, { paddingTop: 52 + safeInsetTop }]}
        >
          <TouchableWithoutFeedback
            containerStyle={{ flex: 1 }}
            style={{
              flex: 1,
            }}
            onPress={() => {
              Keyboard.dismiss()
            }}
          >
            <>
              <View style={{ marginTop: 48 }}>
                <Text style={styles.title}>
                  {translations.recoverPrivateKeyView.title}
                </Text>
                <Text style={styles.subTitle}>
                  {translations.recoverPrivateKeyView.subTitle}
                </Text>
              </View>
              <View style={styles.pasteContainer}>
                <TouchableOpacity
                  onPress={() => {
                    Resources.pasteClipboard().then((value) =>
                      setEncodePrivateKey(value)
                    )
                  }}
                >
                  <Text style={styles.paste}>
                    {translations.recoverPrivateKeyView.paste}
                  </Text>
                </TouchableOpacity>
              </View>
              <TextInput
                keyboardAppearance='dark'
                keyboardType='default'
                multiline={false}
                placeholder={
                  translations.recoverPrivateKeyView.inputPlaceHolder
                }
                placeholderTextColor={Resources.Colors.brownishGrey}
                underlineColorAndroid='transparent'
                style={[styles.privateKeyInput, { height: 64 }]}
                onChangeText={(text) => {
                  setEncodePrivateKey(text.trim())
                }}
                value={encodePrivateKey}
              />
              <View style={{ flex: 1 }} />

              <ThrottleButton
                type='TouchableOpacity'
                style={[
                  isKeyboardShow
                    ? styles.confirmButtonWithoutRadius
                    : styles.confirmButton,
                  {
                    backgroundColor: confirmEnable
                      ? Resources.Colors.brightTeal
                      : Resources.Colors.darkGreyTwo,
                  },
                ]}
                onPress={() => {
                  confirmEnable && onNext()
                }}
              >
                <Text
                  style={[
                    styles.confirmText,
                    {
                      color: confirmEnable
                        ? Resources.Colors.black
                        : Resources.Colors.greyishBrown,
                    },
                  ]}
                >
                  {translations.recoverPrivateKeyView.confirm}
                </Text>
              </ThrottleButton>
              <Animated.View style={{ height: bottomMargin }} />
            </>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </View>

      <BtnBackBlur onPress={() => props.navigation.pop()} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Resources.Colors.darkBackground,
  },
  title: {
    fontFamily: Resources.Fonts.medium,
    fontSize: 24,
    letterSpacing: -0.3,
    color: Resources.Colors.veryLightPinkTwo,
    marginHorizontal: 24,
  },
  subTitle: {
    fontFamily: Resources.Fonts.book,
    fontSize: 14,
    lineHeight: 18,
    letterSpacing: -0.5,
    color: Resources.Colors.greyishBrown,
    marginTop: 11,
    marginHorizontal: 24,
  },
  paste: {
    fontFamily: Resources.Fonts.medium,
    color: Resources.Colors.brightTeal,
    fontSize: 12,
    letterSpacing: -0.3,
  },
  privateKeyInput: {
    borderRadius: 16,
    backgroundColor: Resources.Colors.darkGreyTwo,
    marginHorizontal: 24,

    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
    textAlignVertical: 'top',
    color: Resources.Colors.veryLightPink,
    fontSize: 14,
    letterSpacing: -0.2,
  },
  confirmButton: {
    borderRadius: 30,
    height: 48,
    marginHorizontal: 24,

    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonWithoutRadius: {
    height: 48,

    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmText: {
    fontFamily: Resources.Fonts.medium,
    color: Resources.Colors.black,
    fontSize: 18,
    letterSpacing: -0.5,
  },

  pasteContainer: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginHorizontal: 32,
    marginTop: 50,
    marginBottom: 16,
  },
})
