<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use Symfony\Component\Process\Process;
use Symfony\Component\Process\Exception\ProcessFailedException;

class SignatureValidationService
{
    /**
     * Create a new class instance.
     */
    public function __construct()
    {
        //
    }


    // public function validateSignatures(array $temporaryPaths)
    // {
    //     $pythonScript = base_path('flask/validate-signatures.py');
    //     $venvPython = base_path('flask/venv/Scripts/python.exe');

    //     $process = new Process([
    //         $venvPython,
    //         $pythonScript,
    //         ...$temporaryPaths
    //     ]);

    //     $process->setTimeout(60);
    //     $process->setWorkingDirectory(base_path('flask'));

    //     try {
    //         $process->run();

    //         if (!$process->isSuccessful()) {
    //             Log::error('Python Process Failed', [
    //                 'output' => $process->getOutput(),
    //                 'error_output' => $process->getErrorOutput(),
    //                 'exit_code' => $process->getExitCode()
    //             ]);
    //             throw new ProcessFailedException($process);
    //         }

    //         $output = $process->getOutput();
    //         Log::info('Python Process Output', [
    //             'output' => $output,
    //             'decoded' => json_decode($output, true)
    //         ]);

    //         return json_decode($output, true);
    //     } catch (\Exception $e) {
    //         return [
    //             'error' => $e->getMessage(),
    //             'isMatch' => false,
    //             'averageSimilarity' => 0
    //         ];
    //     }
    // }

    public function validateSignatures(array $temporaryPaths): array
    {
        $pythonScript = base_path('flask/validate-signatures.py');
        $venvPython = base_path('flask/venv/Scripts/python.exe');

        $process = new Process([
            $venvPython,
            $pythonScript,
            ...$temporaryPaths
        ]);

        $process->setTimeout(60);
        $process->setWorkingDirectory(base_path('flask'));

        try {
            $process->run();

            $output = $process->getOutput();
            $errorOutput = $process->getErrorOutput();

            // Log both outputs for debugging
            Log::info('Python Process Output', [
                'stdout' => $output,
                'stderr' => $errorOutput
            ]);

            if (!$process->isSuccessful()) {
                Log::error('Python Process Failed', [
                    'exit_code' => $process->getExitCode(),
                    'error_output' => $errorOutput
                ]);

                return [
                    'success' => false,
                    'error' => 'Process failed: ' . $errorOutput
                ];
            }

            $decoded = json_decode($output, true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                Log::error('JSON Decode Error', [
                    'error' => json_last_error_msg(),
                    'raw_output' => $output
                ]);

                return [
                    'success' => false,
                    'error' => 'Invalid JSON response'
                ];
            }

            return $decoded ?? [
                'success' => false,
                'error' => 'No output from process'
            ];
        } catch (\Exception $e) {
            Log::error('Validation Exception', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }
}
