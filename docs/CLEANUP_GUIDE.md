# Cleanup Guide - Old Files to Remove

After migrating to the feature-based folder structure, the following old files should be deleted:

## Files to Delete

### Old Services (now in features/auth/services/)
- `src/services/google-auth.ts` ❌
- `src/services/auth-service.ts` ❌
- `src/services/api.ts` ❌

### Old Hooks (now in features/auth/hooks/ and core/hooks/)
- `src/hooks/useAuth.ts` ❌
- `src/hooks/useApi.ts` ❌

### Old Components (now in features/auth/components/)
- `src/components/google-sign-in-button.tsx` ❌
- `src/components/` (entire folder if empty)

### Old App Screens (replaced with feature imports)
- `src/app/explore.tsx` ❌ (if it exists)
- Old structure versions of these files

### Old Folder Structure Files
- `src/constants/` (now in `core/constants/`) ❌
- `src/hooks/` (if empty) ❌
- `src/services/` (if empty) ❌
- `src/components/` (if empty) ❌
- `src/types/` (if empty) ❌

## How to Delete

### Via Command Line
```bash
# Remove old services
rm src/services/google-auth.ts
rm src/services/auth-service.ts
rm src/services/api.ts

# Remove old hooks
rm src/hooks/useAuth.ts
rm src/hooks/useApi.ts

# Remove old components
rm src/components/google-sign-in-button.tsx

# Remove empty folders
rmdir src/services
rmdir src/hooks
rmdir src/components
```

### Via File Explorer
1. Navigate to `src/` folder
2. Delete the old folders and files listed above
3. Keep only the new folders: `app/`, `features/`, `core/`, and `global.css`

## Verification

After deletion, your `src/` folder should look like:

```
src/
├── app/
│   ├── _layout.tsx
│   ├── index.tsx
│   ├── login.tsx
│   └── phone-verify.tsx
├── core/
│   ├── api/
│   ├── hooks/
│   ├── constants/
│   └── index.ts
├── features/
│   ├── auth/
│   ├── home/
│   └── index.ts
├── global.css
└── types/ (optional)
```

## If You Get Errors After Deletion

If the app doesn't run after deleting old files:

1. **Check imports**: Search for old import paths in your code
   ```bash
   grep -r "from '../services/" src/
   grep -r "from '../hooks/" src/
   grep -r "from '../components/" src/
   ```

2. **Update imports** to point to the new locations in `features/` and `core/`

3. **Clear cache** and restart the dev server:
   ```bash
   npm start -- --reset-cache
   ```

## Notes

✅ All functionality is preserved - just reorganized  
✅ The new structure is fully functional  
✅ Update imports before deleting old files to avoid breaking things  
✅ Git will track the deletions

## After Cleanup

Your project will be fully migrated to the feature-based architecture with:
- ✅ Clean file structure
- ✅ Better organization
- ✅ Easier scaling
- ✅ No duplicate code
