<?php

declare(strict_types=1);

require __DIR__ . '/vendor/autoload.php';

use Fpdf\Fpdf;
use Sprain\SwissQrBill as QrBill;
use Sprain\SwissQrBill\PaymentPart\Output\DisplayOptions;
use Sprain\SwissQrBill\PaymentPart\Output\FpdfOutput\FpdfOutput;

// 0. Récupération des informations de l'article depuis la requête
$itemName = isset($_GET['name']) && trim((string) $_GET['name']) !== ''
    ? trim((string) $_GET['name'])
    : 'Item';

$amount = isset($_GET['price']) ? round((float) $_GET['price'], 2) : 0.0;

$message = isset($_GET['message']) && trim((string) $_GET['message']) !== ''
    ? trim((string) $_GET['message'])
    : $itemName;

// 1. Création de la QR-facture
$qrBill = QrBill\QrBill::create();

$qrBill->setCreditor(
    QrBill\DataGroup\Element\StructuredAddress::createWithStreet(
        'Nicolas Grosfort',
        'Passage de l\'Intendant',
        '4',
        '1227',
        'Carouge',
        'CH'
    )
);

$qrBill->setCreditorInformation(
    QrBill\DataGroup\Element\CreditorInformation::create(
        'CH74 0027 9279 HU21 5036 0'
    )
);

$qrBill->setPaymentAmountInformation(
    QrBill\DataGroup\Element\PaymentAmountInformation::create(
        'CHF',
        $amount
    )
);


$qrBill->setPaymentReference(
    QrBill\DataGroup\Element\PaymentReference::create(
        QrBill\DataGroup\Element\PaymentReference::TYPE_NON,
        null
    )
);

$qrBill->setAdditionalInformation(
    QrBill\DataGroup\Element\AdditionalInformation::create(
        $message
    )
);

// 2. Création du PDF
$pdf = new Fpdf('P', 'mm', 'A4');
$pdf->AddPage();

// Contenu facultatif au-dessus
$pdf->SetFont('Courier', 'B', 18);
$pdf->Cell(0, 10, 'Stokhastik Store', 0, 1);

$pdf->SetFont('Courier', '', 12);
$pdf->Cell(0, 8, $itemName, 0, 1);
$pdf->Cell(0, 8, sprintf('Montant : CHF %.2f', $amount), 0, 1);

// 3. Ajout de la section QR suisse
$output = new FpdfOutput(
    $qrBill,
    'fr',
    $pdf
);

$displayOptions = new DisplayOptions();

$displayOptions
    ->setPrintable(false)
    ->setDisplayTextDownArrows(false)
    ->setDisplayScissors(false)
    ->setPositionScissorsAtBottom(false);


if (!$qrBill->isValid()) {
    header('Content-Type: text/plain; charset=utf-8');
    http_response_code(400);

    foreach ($qrBill->getViolations() as $violation) {
        echo $violation->getPropertyPath()
            . ' : '
            . $violation->getMessage()
            . PHP_EOL;
    }

    exit;
}


$output
    ->setDisplayOptions($displayOptions)
    ->getPaymentPart();

// 4. Téléchargement
$slug = strtolower((string) preg_replace('/[^a-z0-9]+/i', '-', $itemName));
$slug = trim($slug, '-') ?: 'item';
$pdf->Output("stokhastik-store-{$slug}.pdf", 'D');
exit;
