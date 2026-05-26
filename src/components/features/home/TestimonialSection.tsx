import React from 'react';
import { View, Text, ScrollView, ImageBackground } from 'react-native';
import { Image } from 'expo-image';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { Palette, LightMode } from '@/theme';

interface Testimonial {
  id: string;
  author: string;
  title: string;
  company: string;
  imageUrl: string;
  quote?: string;
}

const testimonials: Testimonial[] = [
  {
    id: '1',
    author: 'Alisa Hester',
    title: 'PM, Hourglass',
    company: 'Web Design Agency',
    imageUrl: 'https://www.untitledui.com/images/portraits/alisa-hester',
  },
  {
    id: '2',
    author: 'Rich Wilson',
    title: 'COO, Command+R',
    company: 'Web Development Agency',
    quote: "We've really sped up our workflow using Untitled.",
    imageUrl: 'https://www.untitledui.com/images/portraits/rich-wilson',
  },
  {
    id: '3',
    author: 'Annie Stanley',
    title: 'Designer, Catalog',
    company: 'UX Agency',
    imageUrl: 'https://www.untitledui.com/images/portraits/annie-stanley',
  },
];

const StarIcon = () => (
  <Ionicons name="star" size={20} color="#FBBF24" />
);

interface TestimonialCardProps {
  testimonial: Testimonial;
}

function TestimonialCard({ testimonial }: TestimonialCardProps) {
  const cardHeight = 300;
  const cardWidth = 200;

  return (
    <View style={{
      position: 'relative',
      height: cardHeight,
      width: cardWidth,
      overflow: 'hidden',
      borderRadius: 8,
      marginRight: 16,
    }}>
      <Image
        source={{ uri: testimonial.imageUrl }}
        style={{ width: '100%', height: '100%' }}
        contentFit="cover"
      />

      {/* Gradient overlay */}
      <View
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
        }}
      />

      {/* Card content */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          paddingTop: 60,
          paddingHorizontal: 12,
          paddingBottom: 12,
        }}
      >
        <BlurView intensity={30} style={{ borderRadius: 12, overflow: 'hidden' }}>
          <View
            style={{
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.3)',
              borderRadius: 12,
              padding: 12,
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            }}
          >
            {testimonial.quote && (
              <Text style={{
                marginBottom: 12,
                fontSize: 12,
                fontWeight: '600',
                color: 'white',
              }}>
                &quot;{testimonial.quote}&quot;
              </Text>
            )}

            <View style={{ gap: 16 }}>
              <View style={{ gap: 12 }}>
                <View style={{ flexDirection: 'row', gap: 4 }}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <StarIcon key={i} />
                  ))}
                </View>
                <Text style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: 'white',
                }}>
                  {testimonial.author}
                </Text>
              </View>

              <View>
                <Text style={{
                  fontSize: 12,
                  fontWeight: '600',
                  color: 'white',
                }}>
                  {testimonial.title}
                </Text>
                <Text style={{
                  fontSize: 11,
                  fontWeight: '500',
                  color: 'white',
                }}>
                  {testimonial.company}
                </Text>
              </View>
            </View>
          </View>
        </BlurView>
      </View>
    </View>
  );
}

export default function TestimonialSection() {
  return (
    <View className="relative w-full rounded-2xl overflow-hidden shadow-lg mb-6 mx-4" style={{ padding: 16, backgroundColor: 'transparent' }}>
      <ImageBackground
        source={{ uri: 'https://ik.imagekit.io/zapigo/homepage/testimonial_section.png' }}
        style={{
          backgroundColor: 'transparent',
          padding: 16,
        }}
        imageStyle={{ resizeMode: 'cover', borderRadius: 16 }}
      >
        <View style={{
          gap: 24,
          paddingHorizontal: 12,
          paddingVertical: 32,
          position: 'relative',
          zIndex: 10,
        }}>
          {/* Header */}
          <View style={{ marginBottom: 16, alignItems: 'center', gap: 16 }}>
            <Text style={{
              fontSize: 28,
              fontWeight: '600',
              color: LightMode.colorTextPrimary,
              fontFamily: 'Literata_600SemiBold',
            }}>
              Testimonials
            </Text>
            <Text style={{
              fontSize: 14,
              color: LightMode.colorTextTertiary,
              textAlign: 'center',
              fontFamily: 'Lexend_400Regular',
              lineHeight: 24,
            }}>
              Hear what our happy clients say about their experience with us
            </Text>
          </View>

          {/* Testimonial Cards - Horizontal Scroll */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 16 }}
            scrollEnabled={true}
          >
            {testimonials.map((testimonial) => (
              <TestimonialCard
                key={testimonial.id}
                testimonial={testimonial}
              />
            ))}
          </ScrollView>
        </View>
      </ImageBackground>
    </View>
  );
}
