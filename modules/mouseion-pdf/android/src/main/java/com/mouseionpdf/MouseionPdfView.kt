package com.mouseionpdf

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Matrix
import android.graphics.Paint
import android.graphics.pdf.PdfRenderer
import android.os.ParcelFileDescriptor
import android.view.View
import java.io.File

class MouseionPdfView(context: Context) : View(context) {

    private var bitmap: Bitmap? = null
    private var filePath: String = ""
    private var pageIndex: Int = 0
    private var scale: Float = 1.0f
    private val paint = Paint(Paint.ANTI_ALIAS_FLAG)

    // Called from ViewManager when the filePath or page prop changes
    fun setFilePath(path: String) {
        if (filePath != path) {
            filePath = path
            renderCurrentPage()
        }
    }

    fun setPage(page: Int) {
        if (pageIndex != page) {
            pageIndex = page
            renderCurrentPage()
        }
    }

    fun setScale(newScale: Float) {
        if (scale != newScale) {
            scale = newScale
            invalidate() // Redraw at new scale without re-rendering
        }
    }

    private fun renderCurrentPage() {
        if (filePath.isEmpty()) return

        // Clean up previous bitmap
        bitmap?.recycle()
        bitmap = null

        try {
            val file = File(filePath)
            if (!file.exists()) return

            val fileDescriptor = ParcelFileDescriptor.open(
                file,
                ParcelFileDescriptor.MODE_READ_ONLY
            )
            val renderer = PdfRenderer(fileDescriptor)

            if (pageIndex < 0 || pageIndex >= renderer.pageCount) {
                renderer.close()
                fileDescriptor.close()
                return
            }

            val pdfPage = renderer.openPage(pageIndex)

            // Calculate render dimensions based on view size and scale
            val viewWidth = if (width > 0) width else 1080
            val viewHeight = if (height > 0) height else 1920

            // Scale the render resolution for zoom
            val renderWidth = (viewWidth * scale).toInt().coerceAtLeast(1)
            val renderHeight = (viewHeight * scale).toInt().coerceAtLeast(1)

            val newBitmap = Bitmap.createBitmap(
                renderWidth,
                renderHeight,
                Bitmap.Config.ARGB_8888
            )
            val canvas = Canvas(newBitmap)
            canvas.drawColor(Color.WHITE)

            pdfPage.render(
                newBitmap,
                null,
                null,
                PdfRenderer.Page.RENDER_MODE_FOR_DISPLAY
            )

            pdfPage.close()
            renderer.close()
            fileDescriptor.close()

            bitmap = newBitmap
            invalidate() // Tell Android to redraw this View
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)
        val currentBitmap = bitmap ?: return

        // Draw the bitmap scaled to fit the view
        val matrix = Matrix()
        val scaleX = width.toFloat() / currentBitmap.width
        val scaleY = height.toFloat() / currentBitmap.height
        val fitScale = minOf(scaleX, scaleY)
        matrix.setScale(fitScale, fitScale)

        // Center the page horizontally
        val scaledWidth = currentBitmap.width * fitScale
        val translateX = (width - scaledWidth) / 2f
        matrix.postTranslate(translateX, 0f)

        canvas.drawBitmap(currentBitmap, matrix, paint)
    }

    override fun onSizeChanged(w: Int, h: Int, oldw: Int, oldh: Int) {
        super.onSizeChanged(w, h, oldw, oldh)
        // Re-render when the view size changes (e.g. rotation)
        if (w > 0 && h > 0) {
            renderCurrentPage()
        }
    }

    override fun onDetachedFromWindow() {
        super.onDetachedFromWindow()
        bitmap?.recycle()
        bitmap = null
    }
}