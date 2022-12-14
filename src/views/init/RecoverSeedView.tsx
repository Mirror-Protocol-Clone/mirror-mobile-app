import React, { useContext, useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import {
  ScrollView,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native-gesture-handler'
import { ConfigContext } from '../../common/provider/ConfigProvider'
import * as Resources from '../../common/Resources'
import ThrottleButton from '../../component/ThrottleButton'
import * as Config from '../../common/Apis/Config'
import { StackActions } from '@react-navigation/native'
import BtnBackBlur from '../../component/BtnBackBlur'
import {
  LazyGradedVestingAccount,
  LCDClient,
  MnemonicKey,
} from '@terra-money/terra.js'
import { validateMnemonic } from '../../libs/key-utils/mnemonic'

export const RecoverSeedView = (props: { navigation: any; route: any }) => {
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
      setTimeout(() => {
        refScrollView?.current?.scrollToEnd()
      }, 200)
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
      setTimeout(() => {
        refScrollView?.current?.scrollTo({ y: 0 })
      }, 200)
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

  const [wordCount, setWordCount] = useState(0)
  const [confirmEnable, setConfirmEnable] = useState(false)

  const [mk, setMk] = useState<string>('')

  const [isAwait, setAwait] = useState(false)
  const refScrollView = useRef<ScrollView | null>(null)

  useEffect(() => {
    try {
      setWordCount(getWordCount(mk))
      setConfirmEnable(validateMnemonic(trimMnemonicWords(mk)))
    } catch {
      //
    }
  }, [mk])

  const trimMnemonicWords = (words: string): string => {
    return words.trim().replace(/\n/g, ' ').replace(/ +/g, ' ')
  }

  const getWordCount = (words: string): number => {
    const split = trimMnemonicWords(words).split(' ')

    let count = 0
    split.forEach((w) => {
      w !== '' && count++
    })

    return count
  }

  const createWallet = async () => {
    setAwait(true)
    hideKeyboard()
    setTimeout(async () => {
      try {
        const trimMk = trimMnemonicWords(mk)
        const mk118 = new MnemonicKey({
          mnemonic: trimMk,
          coinType: 118,
        })
        const mk330 = new MnemonicKey({
          mnemonic: trimMk,
          coinType: 330,
        })

        const getAssets = async (address: string) => {
          const terra = new LCDClient({
            URL: Config.currentDomain.chainDomain,
            chainID: Config.currentDomain.chainId,
          })
          let acct = undefined
          try {
            acct = await terra.auth.accountInfo(address)
          } catch (e) {}

          let balance = undefined
          try {
            balance = await terra.bank.balance(address)
          } catch (e) {}

          let delegations = undefined
          try {
            delegations = await terra.staking.delegations(address)
          } catch (e) {}

          let unbondingDelegations = undefined
          try {
            unbondingDelegations = await terra.staking.unbondingDelegations(
              address
            )
          } catch (e) {}

          return {
            vestingSchedules:
              acct instanceof LazyGradedVestingAccount
                ? acct.vesting_schedules
                : undefined,
            balance: balance?.[0],
            delegations: delegations?.[0],
            unbondingDelegations: unbondingDelegations?.[0],
          }
        }

        const keys = {
          118: {
            mnemonicKey: mk118,
            assets: await getAssets(mk118.accAddress),
          },
          330: {
            mnemonicKey: mk330,
            assets: await getAssets(mk330.accAddress),
          },
        }

        props.navigation.dispatch({
          ...StackActions.replace('SelectWalletView', { keys }),
        })
      } finally {
        setAwait(false)
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
            <ScrollView ref={refScrollView}>
              <View style={{ marginTop: 48 }}>
                <Text style={styles.title}>
                  {translations.recoverSeedView.title}
                </Text>
                <Text style={styles.subTitle}>
                  {translations.recoverSeedView.subTitle}
                </Text>
              </View>
              <View style={styles.wordCountContainer}>
                <View style={{ flexDirection: 'row' }}>
                  <Text style={styles.wordCountText}>{wordCount}</Text>
                  <Text style={styles.wordCountText2}>{'/24'}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    Resources.pasteClipboard().then((value) => setMk(value))
                  }}
                >
                  <Text style={styles.paste}>
                    {translations.recoverSeedView.paste}
                  </Text>
                </TouchableOpacity>
              </View>
              <TextInput
                keyboardAppearance='dark'
                keyboardType='default'
                multiline={true}
                placeholder={translations.recoverSeedView.inputPlaceHolder}
                placeholderTextColor={Resources.Colors.brownishGrey}
                underlineColorAndroid='transparent'
                style={[
                  styles.seedInput,
                  {
                    minHeight: 162,
                    // height: isKeyboardShow ? 200 : undefined,
                  },
                ]}
                onChangeText={(text) => {
                  setMk(text)
                }}
                value={mk.toLowerCase()}
              />
              <View style={{ flex: 1, minHeight: 40 }} />
            </ScrollView>
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
                confirmEnable && createWallet()
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
                {translations.recoverSeedView.confirm}
              </Text>
            </ThrottleButton>
            <Animated.View style={{ height: bottomMargin }} />
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
        {isAwait && (
          <View
            style={{
              position: 'absolute',
              justifyContent: 'center',
              width: Resources.windowSize().width,
              height: Resources.windowSize().height,
            }}
          >
            <ActivityIndicator size='large' color='#ffffff' animating={true} />
          </View>
        )}
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
  seedInput: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: Resources.Colors.darkGreyTwo,
    marginHorizontal: 24,
    lineHeight: 20,

    paddingHorizontal: 24,
    paddingTop: 24,
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

  wordCountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 32,
    marginTop: 50,
    marginBottom: 16,
  },

  wordCountText: {
    fontFamily: Resources.Fonts.book,
    fontSize: 12,
    letterSpacing: -0.3,
    color: Resources.Colors.veryLightPinkTwo,
  },
  wordCountText2: {
    fontFamily: Resources.Fonts.book,
    fontSize: 12,
    letterSpacing: -0.3,
    color: Resources.Colors.brownishGrey,
  },
})
