<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title inertia>{{ config('app.name', 'Quality Management System') }}</title>
        <meta name="description" content="Comprehensive quality management system for tracking, managing, and improving quality processes.">
        <link rel="icon" href="{{ asset('images/plp-1.png') }}">

        <meta property="og:type" content="website">
        <meta property="og:url" content="{{ url()->current() }}">
        <meta property="og:title" content="{{ config('app.name', 'Quality Management System') }}">
        <meta property="og:description" content="Pamantasan ng Lungsod ng Pasig comprehensive quality management system for tracking, managing, and improving document processes.">
        <meta property="og:image" content="{{ asset('images/og-image.png') }}">

        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap" rel="stylesheet">

        <meta name="author" content="{{ config('app.name', 'Quality Management System') }}">
        <meta name="copyright" content="{{ date('Y') }} {{ config('app.name', 'Quality Management System') }}">

        @routes
        @viteReactRefresh
        @vite(['resources/js/app.tsx'])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
