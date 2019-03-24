<?php
    $c = curl_init('url');
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

    $html = curl_exec($c);

    if (curl_error($c))
        die(curl_error($c));

    $status = curl_getinfo($c, CURLINFO_HTTP_CODE);

    curl_close($c);
?>