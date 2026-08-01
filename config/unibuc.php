<?php

$adminEmails = array_filter(array_map(
    fn (string $email): string => strtolower(trim($email)),
    explode(',', env('UNIBUC_ADMIN_EMAILS', ''))
));

return [
    'allowed_domains' => ['s.unibuc.ro', 'unibuc.ro'],
    'admin_emails' => $adminEmails,
    'login_code_minutes' => (int) env('UNIBUC_LOGIN_CODE_MINUTES', 10),
];
