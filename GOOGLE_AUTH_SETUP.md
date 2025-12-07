# Google OAuth Setup

## Настройка Google OAuth в Supabase

### 1. Создайте Google OAuth приложение

1. Перейдите в [Google Cloud Console](https://console.cloud.google.com/)
2. Создайте новый проект или выберите существующий
3. Перейдите в **APIs & Services** → **Credentials**
4. Нажмите **Create Credentials** → **OAuth client ID**
5. Выберите **Web application**

### 2. Настройте Authorized redirect URIs

Добавьте следующий URL:
```
https://sjhgglntqgeaikpehpbj.supabase.co/auth/v1/callback
```

### 3. Получите Client ID и Client Secret

После создания скопируйте:
- Client ID
- Client Secret

### 4. Настройте Supabase

1. Откройте ваш проект в [Supabase Dashboard](https://app.supabase.com/)
2. Перейдите в **Authentication** → **Providers**
3. Найдите **Google** и включите его
4. Вставьте:
   - **Client ID** из Google Console
   - **Client Secret** из Google Console
5. Нажмите **Save**

### 5. Настройте Site URL

В Supabase Dashboard:
1. **Authentication** → **URL Configuration**
2. **Site URL**: добавьте URL вашего приложения
   - Для разработки: `http://localhost:3000`
   - Для Gitpod: ваш Gitpod URL (например, `https://3000--019afabd-0165-718e-85aa-e68c71b39838.eu-central-1-01.gitpod.dev`)
3. **Redirect URLs**: добавьте те же URL

### 6. Проверка

1. Перезапустите клиент
2. Откройте приложение в браузере
3. Нажмите "Continue with Google"
4. Должно открыться окно Google для входа

## Troubleshooting

### Ошибка "redirect_uri_mismatch"

Убедитесь, что в Google Console добавлен правильный redirect URI:
```
https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
```

### Google OAuth не работает

1. Проверьте, что Google Provider включен в Supabase
2. Проверьте Client ID и Secret
3. Проверьте Site URL в Supabase
4. Очистите кэш браузера

### Redirect после входа не работает

Убедитесь, что в Supabase настроены правильные Redirect URLs для вашего окружения.

## Текущая конфигурация

Ваш Supabase URL: `https://sjhgglntqgeaikpehpbj.supabase.co`

Redirect URI для Google Console:
```
https://sjhgglntqgeaikpehpbj.supabase.co/auth/v1/callback
```
