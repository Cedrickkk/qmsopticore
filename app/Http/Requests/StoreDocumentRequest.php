<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreDocumentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */

    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'file' => ['required', 'file', 'mimes:pdf', 'max:2048'],
            'type' => ['required', 'array'],
            'type.id' => ['required', 'exists:document_types,id'],
            'type.name' => ['required', 'string'],
            'category' => ['required', 'array', 'size:2'],
            'category.id' => [
                'required',
                'exists:document_categories,id',
                'exists:document_categories,id,type,' . $this->input('type.id'),
            ],
            'category.name' => ['required', 'string'],
            'users' => ['present', 'array'],
            'users.*.id' => ['sometimes', 'exists:users,id'],
            'users.*.name' => ['sometimes', 'string'],
            'users.*.email' => ['sometimes', 'email'],
            'users.*.signatory' => ['sometimes', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'file.required' => 'The document is required.',
            'file.max' => 'The document must not exceed 2MB.',
            'file.mimes' => 'The document must be a PDF file.',
            'type.id' => 'The document type is required.',
            'type.id.exists' => 'The selected document type is invalid.',
            'category.id' => 'The document category is required.',
            'category.id.exists' => 'The selected category is invalid.',
            'category.id.exists_type' => 'The selected category does not belong to the selected document type.',
        ];
    }
}
