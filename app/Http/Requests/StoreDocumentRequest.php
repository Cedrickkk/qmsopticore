<?php

namespace App\Http\Requests;

use App\Models\Document;
use Illuminate\Support\Facades\Gate;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreDocumentRequest extends FormRequest
{

    public function authorize(): bool
    {
        return Gate::allows('create', Document::class);
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
            'description' => ['required', 'string'],
            'category.name' => ['required', 'string'],
            'users' => ['required', 'array'],
            'users.*.id' => ['required', 'exists:users,id'],
            'users.*.name' => ['required', 'string'],
            'users.*.email' => ['required', 'email'],
            'users.*.signatory' => ['required', 'boolean'],
            'confidentiality_level' => ['required', Rule::in(['public', 'internal', 'confidential'])],
            'priority' => 'required|in:normal,high,urgent',
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
            'description.required' => 'The description field is required.',
            'category.id' => 'The document category is required.',
            'category.id.exists' => 'The selected category is invalid.',
            'category.id.exists_type' => 'The selected category does not belong to the selected document type.',
            'confidentiality_level.required' => 'Please select a confidentiality level',
            'confidentiality_level.in' => 'Invalid confidentiality level',
        ];
    }
}
