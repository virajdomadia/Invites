import React from 'react';
import { View, Text, TouchableOpacity, useWindowDimensions } from 'react-native';
import { Palette, LightMode } from '@/theme';
import ZapigoSVG from '@/components/ui/ZapigoSVG';

const seoText = `Plan your celebration with free digital birthday invitations from Zapigo. Choose from dozens of free birthday invite templates that are easy to personalize and perfect for sharing on WhatsApp. Whether it's a 1st birthday, 5th birthday, or a 30th birthday party, we've got you covered with beautifully designed, mobile-friendly e-invites for all ages. Pick from fun themes like superhero, princess, jungle, unicorn, sports, or construction—all available as free editable birthday invitations.

Every invite comes with a free RSVP tracker, free event website, and a free QR code invite to share with guests. No apps to install, no printing required—just click, customize, and send. Whether you're hosting in Bangalore, Mumbai, Delhi, or Hyderabad, Zapigo makes it easy to plan and manage your celebrations.`;

export default function HomeFooter() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const renderSeoText = () => {
    return seoText.split('\n\n').map((paragraph, index) => (
      <Text
        key={index}
        style={{
          fontSize: isMobile ? 12 : 14,
          color: LightMode.colorTextPrimary,
          fontFamily: 'Lexend_400Regular',
          lineHeight: 20,
          marginBottom: 16,
        }}
      >
        {paragraph}
      </Text>
    ));
  };

  return (
    <View style={{
      width: '100%',
      backgroundColor: Palette.colorBgYellow,
      borderTopWidth: 1,
      borderTopColor: LightMode.colorBorderSecondary,
    }}>
      <View style={{
        paddingHorizontal: isMobile ? 16 : 24,
        paddingVertical: isMobile ? 24 : 32,
      }}>
        {/* Top Section: Logo and SEO Text */}
        <View style={{ gap: 16, marginBottom: 32 }}>
          <ZapigoSVG color="#D5004B" width={isMobile ? 120 : 150} height={isMobile ? 80 : 100} />
          {renderSeoText()}
        </View>

        {/* Middle Section: Links */}
        <View style={{
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? 32 : 32,
          marginBottom: 32,
        }}>
          {/* Product Links */}
          <View style={{ gap: 12 }}>
            <Text style={{
              fontSize: 12,
              fontWeight: '600',
              color: Palette.colorBrand700,
              fontFamily: 'Lexend_600SemiBold',
              marginBottom: 8,
            }}>
              Product
            </Text>
            <TouchableOpacity>
              <Text style={{
                fontSize: isMobile ? 11 : 12,
                fontWeight: '600',
                color: LightMode.colorTextPrimary,
                fontFamily: 'Lexend_600SemiBold',
                marginBottom: 4,
              }}>
                About Us
              </Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text style={{
                fontSize: isMobile ? 11 : 12,
                fontWeight: '600',
                color: LightMode.colorTextPrimary,
                fontFamily: 'Lexend_600SemiBold',
                marginBottom: 4,
              }}>
                Contact Us
              </Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text style={{
                fontSize: isMobile ? 11 : 12,
                fontWeight: '600',
                color: LightMode.colorTextPrimary,
                fontFamily: 'Lexend_600SemiBold',
                marginBottom: 4,
              }}>
                Terms & Conditions
              </Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text style={{
                fontSize: isMobile ? 11 : 12,
                fontWeight: '600',
                color: '#111827',
                fontFamily: 'Lexend_600SemiBold',
              }}>
                Blogs
              </Text>
            </TouchableOpacity>
          </View>

          {/* Occasions Links */}
          <View style={{ gap: 12 }}>
            <Text style={{
              fontSize: 12,
              fontWeight: '600',
              color: '#D5004B',
              fontFamily: 'Lexend_600SemiBold',
              marginBottom: 8,
            }}>
              Occasions
            </Text>
            <TouchableOpacity>
              <Text style={{
                fontSize: isMobile ? 11 : 12,
                fontWeight: '600',
                color: LightMode.colorTextPrimary,
                fontFamily: 'Lexend_600SemiBold',
                marginBottom: 4,
              }}>
                Kids Birthday
              </Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text style={{
                fontSize: isMobile ? 11 : 12,
                fontWeight: '600',
                color: LightMode.colorTextPrimary,
                fontFamily: 'Lexend_600SemiBold',
                marginBottom: 4,
              }}>
                Adult Birthday
              </Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text style={{
                fontSize: isMobile ? 11 : 12,
                fontWeight: '600',
                color: '#111827',
                fontFamily: 'Lexend_600SemiBold',
              }}>
                Housewarming
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom Section: Copyright */}
        <View style={{
          borderTopWidth: 1,
          borderTopColor: LightMode.colorBorderPrimary,
          paddingTop: 16,
        }}>
          <Text style={{
            fontSize: isMobile ? 11 : 12,
            color: LightMode.colorTextPrimary,
            fontFamily: 'Lexend_400Regular',
          }}>
            © Commerce56 Tech India Pvt. Ltd. All rights reserved.
          </Text>
        </View>
      </View>
    </View>
  );
}
