<?php

function updateStatus(string $file, string $id, string $newStatus, ?string $expectedStatus = 'available'): bool
{
    $fp = fopen($file, 'c+');
    if (!$fp) {
        return false;
    }

    if (!flock($fp, LOCK_EX)) {
        fclose($fp);
        return false;
    }

    $content = stream_get_contents($fp);
    $status = json_decode($content, true) ?: [];

    if (array_key_exists($id, $status)) {
        if ($expectedStatus !== null && $status[$id] !== $expectedStatus) {
            flock($fp, LOCK_UN);
            fclose($fp);
            return false;
        }
    }

    $status[$id] = $newStatus;

    ftruncate($fp, 0);
    rewind($fp);
    fwrite($fp, json_encode($status, JSON_PRETTY_PRINT));
    fflush($fp);

    flock($fp, LOCK_UN);
    fclose($fp);
    return true;
}
