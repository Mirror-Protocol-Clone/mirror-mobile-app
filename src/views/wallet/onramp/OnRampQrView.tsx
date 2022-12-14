import React, { useContext } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ConfigContext } from '../../../common/provider/ConfigProvider'
import { NotificationContext } from '../../../common/provider/NotificationProvider'
import { Image, Share, Text, View } from 'react-native'
import * as Resources from '../../../common/Resources'
import * as Utils from '../../../common/Utils'
import QRCode from 'react-native-qrcode-svg'
import RoundedButton from '../../common/RoundedButton'
import OnRampNavHeader from './OnRampNavHeader'
import { TouchableOpacity } from 'react-native-gesture-handler'

const onShare = async (address: string) => {
  try {
    const result = await Share.share({
      message: address,
    })
    switch (result.action) {
      case Share.sharedAction:
        // do nothing
        break
      case Share.dismissedAction:
        // do nothing
        break
    }
  } catch (e) {}
}

const OnRampQrView = (props: { navigation: any; route: any }) => {
  const insets = useSafeAreaInsets()
  const { showNotification } = useContext(NotificationContext)
  const { translations } = useContext(ConfigContext)

  const address = props.route.params.address
  const denom = props.route.params.denom

  return (
    <>
      <View
        style={{
          flex: 1,
          backgroundColor: Resources.Colors.darkBackground,
          paddingHorizontal: 24,
          paddingTop: insets.top + 52,
        }}
      >
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text
            style={{
              fontFamily: Resources.Fonts.bold,
              fontSize: 14,
              lineHeight: 20,
              letterSpacing: -0.3,
              color: Resources.Colors.brightTeal,
              marginBottom: 16,
              textAlign: 'center',
            }}
          >
            {`Deposit ${denom} to the address\nbelow to receive UST`}
          </Text>

          {/** QR */}
          <View
            style={{
              width: 239,
              borderRadius: 24,
              backgroundColor: Resources.Colors.white,
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 30,
            }}
          >
            {address !== '' && (
              <QRCode
                value={address}
                size={148}
                color='black'
                backgroundColor='white'
              />
            )}
            <View
              style={{
                width: 188,
                height: 1,
                marginTop: 33,
                marginBottom: 22,
                backgroundColor: 'rgb(235, 235, 235)',
              }}
            />
            <Text
              style={{
                fontFamily: Resources.Fonts.book,
                fontSize: 14,
                lineHeight: 20,
                letterSpacing: -0.2,
                marginHorizontal: 24,
                color: Resources.Colors.darkGreyTwo,
                textAlign: 'center',
              }}
            >
              {address}
            </Text>
          </View>
        </View>
      </View>
      <View
        style={{
          flexDirection: 'column',
          paddingHorizontal: 20,
          paddingTop: 28,
          paddingBottom: insets.bottom + 40,
          backgroundColor: Resources.Colors.darkGreyFour,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Image
              source={Resources.Images.iconNoticeB}
              style={{ width: 15, height: 13, marginRight: 4 }}
            />
            <Text
              style={{
                fontFamily: Resources.Fonts.medium,
                fontSize: 12,
                letterSpacing: -0.3,
                color: Resources.Colors.greyishBrown,
              }}
            >
              {translations.onRampQrView.notice}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              Utils.contactUs()
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text
                style={{
                  fontFamily: Resources.Fonts.book,
                  fontSize: 12,
                  letterSpacing: -0.2,
                  color: Resources.Colors.brightTeal,
                  marginRight: 4,
                }}
              >
                {translations.onRampQrView.furtherInquiries}
              </Text>
              <Image
                source={Resources.Images.chevronR10G}
                style={{ width: 8, height: 10 }}
              />
            </View>
          </TouchableOpacity>
        </View>
        <Text
          style={{
            fontFamily: Resources.Fonts.book,
            fontSize: 12,
            lineHeight: 16,
            letterSpacing: -0.4,
            color: Resources.Colors.greyishBrown,
            marginTop: 8,
            marginBottom: 28,
          }}
        >
          {translations.onRampQrView.noticeContent}
        </Text>
        <View
          style={{
            flexDirection: 'row',
          }}
        >
          <RoundedButton
            type={'RectButton'}
            style={{ flex: 1 }}
            title={'Share'}
            height={48}
            outline={true}
            onPress={() => {
              onShare(address)
            }}
          />
          <View style={{ width: 9 }} />
          <RoundedButton
            type={'RectButton'}
            style={{ flex: 1 }}
            title={'Copy'}
            height={48}
            outline={false}
            onPress={() => {
              Resources.setClipboard(address)
              showNotification(
                translations.addressPopupView.copied,
                Resources.Colors.brightTeal
              )
            }}
          />
        </View>
      </View>
      <OnRampNavHeader navigation={props.navigation} showBack={false} />
    </>
  )
}

export default OnRampQrView
