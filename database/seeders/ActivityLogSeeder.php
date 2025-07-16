<?php

namespace Database\Seeders;

use App\Models\ActivityLog;
use App\Models\Document;
use App\Models\User;
use Illuminate\Database\Seeder;

class ActivityLogSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = User::all();
        $documents = Document::take(10)->get();

        if ($users->isEmpty()) {
            $this->command->warn('No users found. Please run UserSeeder first.');

            return;
        }

        // Generate login/logout activities
        $randomUserCount = min(5, $users->count());
        foreach ($users->random($randomUserCount) as $user) {
            for ($i = 0; $i < rand(3, 8); $i++) {
                ActivityLog::create([
                    'user_id' => $user->id,
                    'action' => 'login',
                    'entity_type' => 'User',
                    'entity_id' => $user->id,
                    'description' => "User {$user->name} logged in",
                    'ip_address' => fake()->ipv4(),
                    'user_agent' => fake()->userAgent(),
                    'created_at' => fake()->dateTimeBetween('-30 days', 'now'),
                ]);

                ActivityLog::create([
                    'user_id' => $user->id,
                    'action' => 'logout',
                    'entity_type' => 'User',
                    'entity_id' => $user->id,
                    'description' => "User {$user->name} logged out",
                    'ip_address' => fake()->ipv4(),
                    'user_agent' => fake()->userAgent(),
                    'created_at' => fake()->dateTimeBetween('-30 days', 'now'),
                ]);
            }
        }

        // Generate document activities
        if ($documents->isNotEmpty()) {
            foreach ($documents as $document) {
                $randomUser = $users->random();

                // Document viewed
                ActivityLog::create([
                    'user_id' => $randomUser->id,
                    'action' => 'viewed',
                    'entity_type' => 'Document',
                    'entity_id' => $document->id,
                    'description' => "Document '{$document->title}' was viewed",
                    'ip_address' => fake()->ipv4(),
                    'user_agent' => fake()->userAgent(),
                    'created_at' => fake()->dateTimeBetween('-30 days', 'now'),
                ]);

                // Document downloaded
                if (rand(0, 1)) {
                    ActivityLog::create([
                        'user_id' => $randomUser->id,
                        'action' => 'downloaded',
                        'entity_type' => 'Document',
                        'entity_id' => $document->id,
                        'description' => "Document '{$document->title}' was downloaded",
                        'ip_address' => fake()->ipv4(),
                        'user_agent' => fake()->userAgent(),
                        'created_at' => fake()->dateTimeBetween('-30 days', 'now'),
                    ]);
                }

                // Document approved/rejected
                if (rand(0, 1)) {
                    $action = rand(0, 1) ? 'approved' : 'rejected';
                    ActivityLog::create([
                        'user_id' => $randomUser->id,
                        'action' => $action,
                        'entity_type' => 'Document',
                        'entity_id' => $document->id,
                        'description' => "Document '{$document->title}' was {$action}",
                        'ip_address' => fake()->ipv4(),
                        'user_agent' => fake()->userAgent(),
                        'created_at' => fake()->dateTimeBetween('-30 days', 'now'),
                    ]);
                }
            }
        }

        // Generate user management activities
        $randomTargetCount = min(3, $users->count());
        foreach ($users->random($randomTargetCount) as $targetUser) {
            $adminUser = $users->where('id', '!=', $targetUser->id)->random();

            ActivityLog::create([
                'user_id' => $adminUser->id,
                'action' => 'updated',
                'entity_type' => 'User',
                'entity_id' => $targetUser->id,
                'description' => "User account '{$targetUser->name}' was updated",
                'old_values' => ['name' => 'Old Name', 'email' => 'old@example.com'],
                'new_values' => ['name' => $targetUser->name, 'email' => $targetUser->email],
                'ip_address' => fake()->ipv4(),
                'user_agent' => fake()->userAgent(),
                'created_at' => fake()->dateTimeBetween('-30 days', 'now'),
            ]);
        }

        // Generate system activities
        ActivityLog::create([
            'user_id' => null,
            'action' => 'backup_created',
            'entity_type' => null,
            'entity_id' => null,
            'description' => 'System backup was created successfully',
            'ip_address' => '127.0.0.1',
            'user_agent' => 'System',
            'created_at' => fake()->dateTimeBetween('-7 days', 'now'),
        ]);

        ActivityLog::create([
            'user_id' => null,
            'action' => 'maintenance',
            'entity_type' => null,
            'entity_id' => null,
            'description' => 'System maintenance completed',
            'ip_address' => '127.0.0.1',
            'user_agent' => 'System',
            'created_at' => fake()->dateTimeBetween('-14 days', 'now'),
        ]);

        $this->command->info('ActivityLog seeder completed successfully.');
    }
}
