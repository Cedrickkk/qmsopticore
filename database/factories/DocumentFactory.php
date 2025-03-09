<?php

namespace Database\Factories;

use App\Models\DocumentCategory;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Document>
 */
class DocumentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'code' => $this->faker->unique()->regexify('[A-Z]{3}-[0-9]{4}'),
            'title' => $this->faker->sentence(4),
            'creator' => User::all()->random(),
            'status' => $this->faker->randomElement(['approved', 'rejected', 'pending', 'updated']),
            'category' => DocumentCategory::all()->random(),
            'version' => $this->faker->numerify('#.#.#'),
        ];
    }
}
