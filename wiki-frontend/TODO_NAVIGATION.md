# TODO: Migración a React Navigation con Bottom Tabs

## Información Recopilada
- Actualmente usa expo-router con rutas automáticas en la carpeta `app/`.
- `_layout.tsx` tiene un Stack de expo-router y una bottom bar manual con TouchableOpacity y router.push.
- Las pantallas usan `router.push` para navegación (ej. `/detail?id=...`).
- Problema en mobile: Las rutas automáticas y el stack anterior causan problemas con la navegación controlada.

## Plan de Cambios
- Reemplazar expo-router con React Navigation para navegación controlada como en teléfono móvil.
- Crear `AppNavigator.tsx` con `Tab.Navigator` para bottom tabs (Home, Create, Users, Notifications, Profile).
- Cada tab tendrá un `Stack.Navigator` anidado para navegación interna (ej. Home Stack: Home -> Detail).
- Modificar todas las pantallas para usar `navigation.navigate` en lugar de `router.push`.
- Cambiar el punto de entrada de "expo-router/entry" a un `index.js` que importe `AppNavigator`.
- Eliminar o renombrar archivos relacionados con expo-router (como `_layout.tsx`).

## Pasos Detallados
1. ✅ Crear `AppNavigator.tsx` con la estructura de navegación.
2. ✅ Modificar `index.tsx` (pantalla de login/register) para usar navigation.
3. ✅ Modificar `home.tsx` para usar navigation.
4. ✅ Modificar `detail.tsx` para usar navigation.
5. ✅ Modificar `create.tsx` para usar navigation.
6. ✅ Modificar `users.tsx` para usar navigation.
7. ✅ Modificar `notifications.tsx` para usar navigation.
8. ✅ Modificar `profile.tsx` para usar navigation.
9. ✅ Crear `index.js` como punto de entrada.
10. ✅ Actualizar `package.json` para cambiar "main".
11. ✅ Probar la navegación en mobile.

## Archivos a Modificar
- `app/_layout.tsx` -> Eliminar o renombrar.
- `app/index.tsx`
- `app/home.tsx`
- `app/detail.tsx`
- `app/create.tsx`
- `app/users.tsx`
- `app/notifications.tsx`
- `app/profile.tsx`
- `package.json`
- Nuevo: `AppNavigator.tsx`
- Nuevo: `index.js`

## Dependencias
- Ya tiene React Navigation instaladas: @react-navigation/native, bottom-tabs, stack, etc.
- No necesita instalar nada nuevo.
