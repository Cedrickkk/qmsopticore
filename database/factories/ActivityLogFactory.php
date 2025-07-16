<?php

namespace Database\Factories;

use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ActivityLogFactory extends Factory
{
    protected $model = ActivityLog::class;

    public function definition(): array
    {
        $actions = [
            'login',
            'logout',
            'created',
            'updated',
            'deleted',
            'viewed',
            'downloaded',
            'approved',
            'rejected',
            'published',
            'archived',
        ];

        $entityTypes = ['Document', 'User', null];
        $entityType = $this->faker->randomElement($entityTypes);

        return [
            'user_id' => User::factory(),
            'action' => $this->faker->randomElement($actions),
            'entity_type' => $entityType,
            'entity_id' => $entityType ? $this->faker->numberBetween(1, 100) : null,
            'description' => $this->faker->sentence(),
            'old_values' => $this->faker->boolean(30) ? ['field' => 'old_value'] : null,
            'new_values' => $this->faker->boolean(30) ? ['field' => 'new_value'] : null,
            'ip_address' => $this->faker->ipv4(),
            'user_agent' => $this->faker->userAgent(),
            'created_at' => $this->faker->dateTimeBetween('-30 days', 'now'),
        ];
    }

    public function login(): static
    {
        return $this->state(fn (array $attributes) => [
            'action' => 'login',
            'description' => 'User logged in',
            'entity_type' => 'User',
        ]);
    }

    public function logout(): static
    {
        return $this->state(fn (array $attributes) => [
            'action' => 'logout',
            'description' => 'User logged out',
            'entity_type' => 'User',
        ]);
    }

    public function documentAction(): static
    {
        return $this->state(fn (array $attributes) => [
            'entity_type' => 'Document',
            'action' => $this->faker->randomElement(['viewed', 'downloaded', 'approved', 'rejected']),
        ]);
    }
}
