import { passkeyClient } from '@better-auth/passkey/client';
import { createAuthClient } from 'better-auth/svelte';

import { PUBLIC_URL } from '$env/static/public';

export const authClient = createAuthClient({
	plugins: [passkeyClient()],
	baseURL: PUBLIC_URL
});
