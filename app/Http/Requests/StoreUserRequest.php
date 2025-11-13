<?php

namespace App\Http\Requests;

use App\Enums\PermissionEnum;
use Illuminate\Validation\Rules\Password;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class StoreUserRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */

    public function authorize(): bool
    {
        return Auth::user()->hasPermissionTo(PermissionEnum::USER_CREATE->value);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                'unique:users',
                'ends_with:@plpasig.edu.ph'
            ],
            'password' => ['required', 'string', 'min:8', Password::defaults(), 'confirmed'],
            'department' => ['required', 'string', 'max:255'],
            'position' => ['required', 'string', 'max:255'],
            'image' => [
                'required',
                'file',
                'mimes:jpg,jpeg,png',
                'max:2048',
            ],
            'signatures' => [
                'required',
                'array',
                'min:7',
                'max:7',
            ],
            'signatures.*' => [
                'required',
                'file',
                'mimes:jpg,jpeg,png',
                'max:2048',
            ],
            'role' => ['required', 'string', 'in:super_admin,department_admin,regular_user']
        ];
    }

    public function messages(): array
    {
        return [
            'email.ends_with' => 'The email must end with @plpasig.edu.ph domain.',

            'department.required' => 'The department is required.',

            'position.required' => 'The position field is required',

            'image.max' => 'The profile image must not exceed 1MB.',
            'image.mimes' => 'The profile image must be a file of type: jpg, jpeg, png.',
            'image.required' => 'A profile image is required.',

            'signatures.*.max' => 'Signature file must not exceed 1MB.',
            'signatures.*.mimes' => 'Signature file :input must be a jpg, jpeg, or png.',
            'signatures.size' => 'You must upload exactly 7 signatures.',

            'signatures.required' => 'Signatures are required.',
            'signatures.array' => 'Signatures must be provided as a collection.',
            'signatures.min' => 'You must upload exactly 7 signatures.',
            'signatures.max' => 'You cannot upload more than 7 signatures.',
        ];
    }
}
