<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateDocumentAccessRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'users' => 'required|array',
            'users.*.id' => 'required|exists:users,id',
            'users.*.permissions' => 'required|array',
            'users.*.permissions.view' => 'required|boolean',
            'users.*.permissions.edit' => 'required|boolean',
            'users.*.permissions.download' => 'required|boolean',
            'users.*.permissions.share' => 'required|boolean',
        ];
    }
}
