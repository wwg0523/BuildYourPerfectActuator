// Google OAuth Types
// 라이브러리의 타입을 다시 내보내기
export type { CredentialResponse } from '@react-oauth/google';

declare global {
    interface Window {
        google: any;
    }
}

