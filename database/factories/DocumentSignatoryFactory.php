<?php

namespace Database\Factories;

use App\Models\Document;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\DocumentSignatory>
 */
class DocumentSignatoryFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'document_id' => Document::factory(),
            'user_id' => User::factory(),
            'signatory_order' => fake()->numberBetween(1, 5),
            'status' => fake()->randomElement(['pending', 'approved', 'rejected']),
            'signed_at' => fn(array $attributes) =>
            $attributes['status'] !== 'pending' ? fake()->dateTimeBetween('-30 days') : null,
            'comment' => fn(array $attributes) =>
            $attributes['status'] === 'rejected' ? fake()->sentence() : null,
        ];
    }

    public function pending(): static
    {
        return $this->state(fn(array $attributes) => [
            'status' => 'pending',
            'signed_at' => null,
            'comment' => null,
        ]);
    }

    public function approved(): static
    {
        return $this->state(fn(array $attributes) => [
            'status' => 'approved',
            'signed_at' => fake()->dateTimeBetween('-30 days'),
            'comment' => null,
        ]);
    }

    public function rejected(): static
    {
        return $this->state(fn(array $attributes) => [
            'status' => 'rejected',
            'signed_at' => fake()->dateTimeBetween('-30 days'),
            'comment' => fake()->sentence(),
        ]);
    }
}
