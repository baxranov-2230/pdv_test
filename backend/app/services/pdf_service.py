"""
PDF generatsiya qilish xizmati
Guruh bo'yicha test natijalarini PDF formatda yaratadi
"""
from io import BytesIO
from typing import List, Dict
from datetime import datetime
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont


def generate_group_results_pdf(group_id: str, results: List[Dict]) -> BytesIO:
    """
    Guruh bo'yicha test natijalarini PDF formatda yaratadi
    
    Args:
        group_id: Guruh identifikatori
        results: Test natijalari ro'yxati
        
    Returns:
        BytesIO: PDF fayl bufferi
    """
    buffer = BytesIO()
    
    # PDF hujjatni yaratish (landscape orientatsiya)
    doc = SimpleDocTemplate(
        buffer,
        pagesize=landscape(A4),
        rightMargin=30,
        leftMargin=30,
        topMargin=30,
        bottomMargin=30,
    )
    
    # Style'larni olish
    styles = getSampleStyleSheet()
    
    # O'zbek tilida sarlavhalar uchun style
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=18,
        textColor=colors.HexColor('#1976d2'),
        spaceAfter=12,
        alignment=1,  # Center
    )
    
    subtitle_style = ParagraphStyle(
        'CustomSubtitle',
        parent=styles['Normal'],
        fontSize=12,
        textColor=colors.grey,
        spaceAfter=20,
        alignment=1,  # Center
    )
    
    # PDF elementlari
    elements = []
    
    # Sarlavha
    title = Paragraph(f"Test Natijalari - Guruh: {group_id}", title_style)
    elements.append(title)
    
    # Sana
    current_date = datetime.now().strftime("%d.%m.%Y %H:%M")
    subtitle = Paragraph(f"Yaratilgan sana: {current_date}", subtitle_style)
    elements.append(subtitle)
    
    # Bo'sh joy
    elements.append(Spacer(1, 0.2 * inch))
    
    if not results:
        # Natijalar yo'q bo'lsa
        no_data = Paragraph("Ushbu guruh uchun test natijalari topilmadi.", styles['Normal'])
        elements.append(no_data)
    else:
        # Jadval ma'lumotlarini tayyorlash
        table_data = [
            ['№', 'Talaba', 'Test', 'Ball (foiz)', 'Sana', 'Holat']
        ]
        
        # Statistika uchun
        total_score = 0
        passed_count = 0
        failed_count = 0
        
        for idx, result in enumerate(results, 1):
            score = result.get('score', 0)
            total_score += score
            
            # Holat
            status = 'O\'tdi' if score >= 50 else 'O\'tmadi'
            if score >= 50:
                passed_count += 1
            else:
                failed_count += 1
            
            # Sanani formatlash
            taken_at = result.get('taken_at', '')
            if taken_at:
                try:
                    date_obj = datetime.fromisoformat(str(taken_at).replace('Z', '+00:00'))
                    taken_at = date_obj.strftime("%d.%m.%Y %H:%M")
                except:
                    taken_at = str(taken_at)[:16]
            
            table_data.append([
                str(idx),
                result.get('student_name', 'N/A'),
                result.get('test_title', 'N/A'),
                f"{score:.1f}%",
                taken_at,
                status
            ])
        
        # Jadval yaratish
        table = Table(table_data, colWidths=[0.5*inch, 2.5*inch, 2.5*inch, 1*inch, 1.5*inch, 1*inch])
        
        # Jadval style'i
        table.setStyle(TableStyle([
            # Header row
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1976d2')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            
            # Data rows
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('TEXTCOLOR', (0, 1), (-1, -1), colors.black),
            ('ALIGN', (0, 1), (0, -1), 'CENTER'),  # № column
            ('ALIGN', (3, 1), (3, -1), 'CENTER'),  # Ball column
            ('ALIGN', (4, 1), (4, -1), 'CENTER'),  # Sana column
            ('ALIGN', (5, 1), (5, -1), 'CENTER'),  # Holat column
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 10),
            ('GRID', (0, 0), (-1, -1), 1, colors.grey),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.lightgrey]),
        ]))
        
        elements.append(table)
        
        # Statistika
        elements.append(Spacer(1, 0.3 * inch))
        
        avg_score = total_score / len(results) if results else 0
        
        stats_style = ParagraphStyle(
            'Stats',
            parent=styles['Normal'],
            fontSize=11,
            spaceAfter=6,
        )
        
        elements.append(Paragraph("<b>Statistika:</b>", stats_style))
        elements.append(Paragraph(f"• Jami talabalar: {len(results)}", stats_style))
        elements.append(Paragraph(f"• O'rtacha ball: {avg_score:.1f}%", stats_style))
        elements.append(Paragraph(f"• O'tganlar: {passed_count} ({passed_count/len(results)*100:.1f}%)", stats_style))
        elements.append(Paragraph(f"• O'tmaganlar: {failed_count} ({failed_count/len(results)*100:.1f}%)", stats_style))
    
    # PDF ni yaratish
    doc.build(elements)
    
    # Buffer'ni boshiga qaytarish
    buffer.seek(0)
    return buffer
