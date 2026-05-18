# NativeWind - Tailwind for React Native

This project now uses **NativeWind**, which brings Tailwind CSS utility-first styling to React Native and Expo.

## ✨ Features

- 🎨 Use Tailwind CSS classes in React Native
- 🔧 No StyleSheet needed - simpler component code
- 📱 Works across iOS, Android, and Web
- 🚀 Better performance with compiled styles
- 🎯 Consistent styling with web projects

## 📚 Usage Guide

### Basic Layout

```tsx
import { View, Text } from 'react-native';

export default function MyComponent() {
  return (
    <View className="flex-1 justify-center items-center bg-blue-50 p-4">
      <Text className="text-2xl font-bold text-blue-900">
        Hello NativeWind!
      </Text>
    </View>
  );
}
```

### Common Classes

#### Layout & Flexbox
- `flex-1` - Flex grow 1
- `flex-row` - Horizontal layout
- `justify-center` - Center items on main axis
- `items-center` - Center items on cross axis
- `gap-4` - Add spacing between items

#### Sizing
- `w-full` - Full width
- `h-screen` - Full screen height
- `w-12`, `h-12` - 48px × 48px (3rem)
- `min-h-10` - Minimum height

#### Padding & Margin
- `p-4` - Padding 16px on all sides
- `px-4` - Horizontal padding only
- `py-2` - Vertical padding only
- `m-4` - Margin 16px
- `mb-2` - Margin bottom

#### Colors
- `bg-blue-50` - Background color (50-900 shades)
- `text-gray-900` - Text color
- `border-red-500` - Border color
- Custom colors defined in `tailwind.config.js`:
  - `bg-primary` - #007AFF
  - `bg-secondary` - #5AC8FA
  - `bg-success` - #34C759
  - `bg-error` - #FF3B30

#### Typography
- `text-sm`, `text-base`, `text-lg`, `text-xl`, `text-2xl`, `text-4xl`
- `font-light`, `font-normal`, `font-semibold`, `font-bold`
- `text-center`, `text-left`, `text-right`

#### Border & Shadow
- `border` - Add border
- `rounded-lg` - Border radius
- `rounded-full` - Circular
- `shadow-md` - Shadow effect (mobile)

#### Display
- `hidden` - Display none
- `opacity-50` - Transparency

## 🎨 Tailwind Classes Reference

### Size Units (4px base)
- `1` = 4px
- `2` = 8px
- `3` = 12px
- `4` = 16px
- `6` = 24px
- `8` = 32px
- `12` = 48px

## 🔄 Migration from StyleSheet

**Before (StyleSheet):**
```tsx
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
});

<View style={styles.container}>
  <Text style={styles.text}>Hello</Text>
</View>
```

**After (NativeWind):**
```tsx
<View className="flex-1 justify-center items-center bg-slate-50 p-4">
  <Text className="text-lg font-bold text-gray-900">Hello</Text>
</View>
```

## 🛠️ Configuration

Edit `tailwind.config.js` to:
- Add custom colors
- Extend spacing
- Add custom utilities
- Configure content paths

Example:
```js
theme: {
  extend: {
    colors: {
      brand: '#FF6B00',
    },
  },
},
```

Then use: `className="bg-brand text-white"`

## 📖 Resources

- [NativeWind Docs](https://www.nativewind.dev)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [React Native Documentation](https://reactnative.dev/docs/intro)

## 💡 Tips

1. Use `flex-1` instead of percentage-based widths
2. Combine classes: `flex-1 justify-center items-center`
3. Use responsive design with mobile-first approach
4. Keep components small and focused
5. Extract complex styles into reusable components
