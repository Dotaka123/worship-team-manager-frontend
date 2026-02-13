import jsPDF from 'jspdf';
import 'jspdf-autotable';

const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

// Générer un reçu individuel
export const generateReceipt = (contribution, churchName = 'Mon Église') => {
  const doc = new jsPDF();
  const { member, year, month, amount, paidAt, paymentMethod } = contribution;
  
  // En-tête
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(churchName, 105, 25, { align: 'center' });
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text('REÇU DE COTISATION', 105, 35, { align: 'center' });
  
  // Ligne de séparation
  doc.setDrawColor(100, 100, 100);
  doc.line(20, 42, 190, 42);
  
  // Numéro de reçu
  const receiptNumber = `REC-${year}${String(month).padStart(2, '0')}-${member._id.slice(-4).toUpperCase()}`;
  doc.setFontSize(10);
  doc.text(`N° ${receiptNumber}`, 190, 50, { align: 'right' });
  
  // Informations
  doc.setFontSize(12);
  const startY = 60;
  const lineHeight = 10;
  
  doc.setFont('helvetica', 'bold');
  doc.text('Reçu de :', 20, startY);
  doc.setFont('helvetica', 'normal');
  doc.text(`${member.firstName} ${member.lastName}`, 60, startY);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Période :', 20, startY + lineHeight);
  doc.setFont('helvetica', 'normal');
  doc.text(`${MONTHS[month - 1]} ${year}`, 60, startY + lineHeight);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Montant :', 20, startY + lineHeight * 2);
  doc.setFont('helvetica', 'normal');
  doc.text(`${amount.toLocaleString()} Ar`, 60, startY + lineHeight * 2);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Mode :', 20, startY + lineHeight * 3);
  doc.setFont('helvetica', 'normal');
  const paymentLabels = {
    cash: 'Espèces',
    mobile_money: 'Mobile Money',
    bank: 'Virement bancaire',
    other: 'Autre'
  };
  doc.text(paymentLabels[paymentMethod] || 'Espèces', 60, startY + lineHeight * 3);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Date :', 20, startY + lineHeight * 4);
  doc.setFont('helvetica', 'normal');
  const paidDate = paidAt ? new Date(paidAt).toLocaleDateString('fr-FR') : '-';
  doc.text(paidDate, 60, startY + lineHeight * 4);
  
  // Cadre montant
  doc.setDrawColor(0, 0, 0);
  doc.setFillColor(240, 240, 240);
  doc.roundedRect(120, startY + lineHeight * 2 - 5, 70, 15, 3, 3, 'FD');
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`${amount.toLocaleString()} Ar`, 155, startY + lineHeight * 2 + 4, { align: 'center' });
  
  // Signature
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Signature du trésorier :', 130, startY + lineHeight * 6);
  doc.line(130, startY + lineHeight * 8, 190, startY + lineHeight * 8);
  
  // Pied de page
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(`Document généré le ${new Date().toLocaleDateString('fr-FR')}`, 105, 280, { align: 'center' });
  
  // Télécharger
  doc.save(`recu_${member.lastName}_${MONTHS[month - 1]}_${year}.pdf`);
};

// Générer un récapitulatif mensuel
export const generateMonthlyReport = (contributions, year, month, stats, churchName = 'Mon Église') => {
  const doc = new jsPDF();
  
  // En-tête
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(churchName, 105, 20, { align: 'center' });
  
  doc.setFontSize(14);
  doc.text(`Rapport des cotisations - ${MONTHS[month - 1]} ${year}`, 105, 30, { align: 'center' });
  
  // Ligne de séparation
  doc.setDrawColor(100, 100, 100);
  doc.line(20, 35, 190, 35);
  
  // Statistiques
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  
  const paidCount = contributions.filter(c => c.isPaid).length;
  const unpaidCount = contributions.filter(c => !c.isPaid).length;
  const totalCollected = contributions.filter(c => c.isPaid).reduce((sum, c) => sum + c.amount, 0);
  
  doc.text(`Total membres actifs : ${contributions.length}`, 20, 45);
  doc.text(`Cotisations payées : ${paidCount}`, 20, 52);
  doc.text(`Cotisations en attente : ${unpaidCount}`, 20, 59);
  doc.setFont('helvetica', 'bold');
  doc.text(`Montant total collecté : ${totalCollected.toLocaleString()} Ar`, 20, 66);
  
  // Tableau des payés
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Membres ayant payé', 20, 80);
  
  const paidMembers = contributions.filter(c => c.isPaid);
  if (paidMembers.length > 0) {
    doc.autoTable({
      startY: 85,
      head: [['Nom', 'Rôle', 'Montant', 'Date de paiement', 'Mode']],
      body: paidMembers.map(c => [
        `${c.member.firstName} ${c.member.lastName}`,
        c.member.role || '-',
        `${c.amount.toLocaleString()} Ar`,
        c.paidAt ? new Date(c.paidAt).toLocaleDateString('fr-FR') : '-',
        { cash: 'Espèces', mobile_money: 'Mobile', bank: 'Banque', other: 'Autre' }[c.paymentMethod] || '-'
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [79, 70, 229] }
    });
  }
  
  // Tableau des non-payés
  const unpaidMembers = contributions.filter(c => !c.isPaid);
  if (unpaidMembers.length > 0) {
    const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 15 : 120;
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Membres en attente de paiement', 20, finalY);
    
    doc.autoTable({
      startY: finalY + 5,
      head: [['Nom', 'Rôle', 'Montant dû']],
      body: unpaidMembers.map(c => [
        `${c.member.firstName} ${c.member.lastName}`,
        c.member.role || '-',
        `${c.amount.toLocaleString()} Ar`
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [220, 38, 38] }
    });
  }
  
  // Pied de page
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(
      `Page ${i} sur ${pageCount} - Généré le ${new Date().toLocaleDateString('fr-FR')}`,
      105, 290, { align: 'center' }
    );
  }
  
  // Télécharger
  doc.save(`rapport_cotisations_${MONTHS[month - 1]}_${year}.pdf`);
};

// Générer l'historique d'un membre
export const generateMemberHistory = (member, history, churchName = 'Mon Église') => {
  const doc = new jsPDF();
  
  // En-tête
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(churchName, 105, 20, { align: 'center' });
  
  doc.setFontSize(14);
  doc.text(`Historique des cotisations`, 105, 30, { align: 'center' });
  
  // Ligne de séparation
  doc.setDrawColor(100, 100, 100);
  doc.line(20, 35, 190, 35);
  
  // Infos membre
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`${member.firstName} ${member.lastName}`, 20, 45);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Rôle : ${member.role || 'N/A'}`, 20, 52);
  if (member.instrument) {
    doc.text(`Instrument : ${member.instrument}`, 20, 58);
  }
  
  // Stats
  const totalPaid = history.filter(h => h.isPaid).length;
  const totalAmount = history.filter(h => h.isPaid).reduce((sum, h) => sum + h.amount, 0);
  
  doc.setFontSize(11);
  doc.text(`Total cotisations payées : ${totalPaid}`, 120, 45);
  doc.setFont('helvetica', 'bold');
  doc.text(`Montant total : ${totalAmount.toLocaleString()} Ar`, 120, 52);
  
  // Tableau historique
  if (history.length > 0) {
    doc.autoTable({
      startY: 70,
      head: [['Période', 'Montant', 'Statut', 'Date de paiement', 'Mode']],
      body: history.map(h => [
        `${MONTHS[h.month - 1]} ${h.year}`,
        `${h.amount.toLocaleString()} Ar`,
        h.isPaid ? 'Payé' : 'Non payé',
        h.paidAt ? new Date(h.paidAt).toLocaleDateString('fr-FR') : '-',
        h.isPaid ? ({ cash: 'Espèces', mobile_money: 'Mobile', bank: 'Banque', other: 'Autre' }[h.paymentMethod] || '-') : '-'
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [79, 70, 229] },
      bodyStyles: { 
        fillColor: (rowIndex) => history[rowIndex]?.isPaid ? [240, 253, 244] : [254, 242, 242]
      }
    });
  } else {
    doc.text('Aucun historique trouvé', 105, 80, { align: 'center' });
  }
  
  // Pied de page
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(`Document généré le ${new Date().toLocaleDateString('fr-FR')}`, 105, 280, { align: 'center' });
  
  // Télécharger
  doc.save(`historique_${member.lastName}_${member.firstName}.pdf`);
};
