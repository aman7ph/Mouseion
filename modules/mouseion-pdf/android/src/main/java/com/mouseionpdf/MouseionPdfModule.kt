package com.mouseionpdf

import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.pdf.PdfRenderer
import android.os.ParcelFileDescriptor
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import java.io.File
import java.io.FileOutputStream

class MouseionPdfModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "MouseionPdf"

    @ReactMethod
    fun getPageCount(filePath: String, promise: Promise) {
        try {
            val file = File(filePath)
            if (!file.exists()) {
                promise.reject("FILE_NOT_FOUND", "File not found: $filePath")
                return
            }
            val fileDescriptor = ParcelFileDescriptor.open(
                file,
                ParcelFileDescriptor.MODE_READ_ONLY
            )
            val renderer = PdfRenderer(fileDescriptor)
            val count = renderer.pageCount
            renderer.close()
            fileDescriptor.close()
            promise.resolve(count)
        } catch (e: Exception) {
            promise.reject("PDF_ERROR", e.message ?: "Unknown error", e)
        }
    }

    @ReactMethod
    fun renderPage(
        filePath: String,
        page: Int,
        width: Int,
        height: Int,
        promise: Promise
    ) {
        try {
            val file = File(filePath)
            if (!file.exists()) {
                promise.reject("FILE_NOT_FOUND", "File not found: $filePath")
                return
            }

            val fileDescriptor = ParcelFileDescriptor.open(
                file,
                ParcelFileDescriptor.MODE_READ_ONLY
            )
            val renderer = PdfRenderer(fileDescriptor)

            if (page < 0 || page >= renderer.pageCount) {
                renderer.close()
                fileDescriptor.close()
                promise.reject("INVALID_PAGE", "Page $page is out of range")
                return
            }

            val pdfPage = renderer.openPage(page)

            // Create a white bitmap at the requested dimensions
            val bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
            val canvas = Canvas(bitmap)
            canvas.drawColor(Color.WHITE)

            // Render the PDF page into the bitmap
            pdfPage.render(bitmap, null, null, PdfRenderer.Page.RENDER_MODE_FOR_DISPLAY)
            pdfPage.close()
            renderer.close()
            fileDescriptor.close()

            // Write the bitmap to a temp file in the cache directory
            val cacheDir = reactContext.cacheDir
            val outputDir = File(cacheDir, "mouseion_pdf_pages")
            if (!outputDir.exists()) outputDir.mkdirs()

            val outputFile = File(outputDir, "page_${filePath.hashCode()}_${page}.png")
            val outputStream = FileOutputStream(outputFile)
            bitmap.compress(Bitmap.CompressFormat.PNG, 100, outputStream)
            outputStream.flush()
            outputStream.close()
            bitmap.recycle()

            promise.resolve("file://${outputFile.absolutePath}")
        } catch (e: Exception) {
            promise.reject("RENDER_ERROR", e.message ?: "Unknown error", e)
        }
    }
}