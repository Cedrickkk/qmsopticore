<?php

namespace Database\Factories;


use App\Models\User;
use App\Models\Document;
use App\Models\DocumentWorkflowLog;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\DocumentWorkflowLog>
 */
class DocumentWorkflowLogFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $statuses = ['draft', 'in_review', 'approved', 'rejected', 'published', 'archived'];
        $fromStatus = $this->faker->randomElement($statuses);

        // Ensure toStatus is different from fromStatus
        do {
            $toStatus = $this->faker->randomElement($statuses);
        } while ($fromStatus === $toStatus);

        $actions = [
            'created',
            'updated',
            'status_changed',
            'approved',
            'rejected',
            'published',
            'archived',
            'comment_added'
        ];

        return [
            'document_id' => Document::factory(),
            'user_id' => User::factory(),
            'action' => $this->faker->randomElement($actions),
            'from_status' => $fromStatus,
            'to_status' => $toStatus,
            'notes' => $this->faker->boolean(70) ? $this->faker->paragraph() : null,
            'created_at' => $this->faker->dateTimeBetween('-30 days', 'now'),
            'updated_at' => function (array $attributes) {
                return $attributes['created_at'];
            },
        ];
    }

    /**
     * Configure the model factory.
     */
    public function configure(): static
    {
        return $this->afterCreating(function (DocumentWorkflowLog $log) {
            // Set action based on status changes
            if ($log->from_status !== $log->to_status) {
                $log->action = 'status_changed';
            }

            if ($log->to_status === 'approved') {
                $log->action = 'approved';
            } elseif ($log->to_status === 'rejected') {
                $log->action = 'rejected';
            } elseif ($log->to_status === 'published') {
                $log->action = 'published';
            } elseif ($log->to_status === 'archived') {
                $log->action = 'archived';
            }

            $log->save();
        });
    }

    /**
     * State for document creation logs.
     */
    public function creation(): static
    {
        return $this->state(function () {
            return [
                'action' => 'created',
                'from_status' => null,
                'to_status' => 'draft',
                'notes' => 'Document created',
            ];
        });
    }

    /**
     * State for status change logs.
     */
    public function statusChange(string $from, string $to): static
    {
        return $this->state(function () use ($from, $to) {
            return [
                'action' => 'status_changed',
                'from_status' => $from,
                'to_status' => $to,
                'notes' => "Status changed from {$from} to {$to}",
            ];
        });
    }
}
