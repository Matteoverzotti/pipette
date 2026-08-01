<?php

namespace App\Support;

class UniBucIdentity
{
    public static function normalizeEmail(string $email): string
    {
        return strtolower(trim($email));
    }

    public static function hasAllowedDomain(string $email): bool
    {
        $email = self::normalizeEmail($email);

        if (! str_contains($email, '@')) {
            return false;
        }

        $domain = str($email)->afterLast('@')->toString();

        return in_array($domain, config('unibuc.allowed_domains', []), true);
    }

    public static function isAdminEmail(string $email): bool
    {
        return in_array(self::normalizeEmail($email), config('unibuc.admin_emails', []), true);
    }
}
