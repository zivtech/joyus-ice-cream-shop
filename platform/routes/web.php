<?php

use Illuminate\Support\Facades\Route;

// Catch-all: serve the SPA for every non-API route so React Router handles navigation.
Route::get('/{any?}', function () {
    return view('app');
})->where('any', '^(?!api).*');
