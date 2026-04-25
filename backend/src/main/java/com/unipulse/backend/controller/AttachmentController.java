package com.unipulse.backend.Controller;

import com.unipulse.backend.service.TicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/attachments")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class AttachmentController {

    private final TicketService ticketService;

    @GetMapping("/{attachmentId}/download")
    public ResponseEntity<Resource> downloadAttachment(@PathVariable Long attachmentId) {
        byte[] fileContent = ticketService.downloadAttachment(attachmentId);
        ByteArrayResource resource = new ByteArrayResource(fileContent);

        // You might want to get the filename from the database here
        String filename = "attachment_" + attachmentId;

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .contentLength(fileContent.length)
                .body(resource);
    }

    @GetMapping("/{attachmentId}/view")
    public ResponseEntity<Resource> viewAttachment(@PathVariable Long attachmentId) {
        byte[] fileContent = ticketService.downloadAttachment(attachmentId);
        ByteArrayResource resource = new ByteArrayResource(fileContent);

        // Determine content type based on file content or use a default
        MediaType mediaType = MediaType.IMAGE_JPEG; // Default to JPEG
        // You could enhance this to detect the actual file type

        return ResponseEntity.ok()
                .contentType(mediaType)
                .contentLength(fileContent.length)
                .body(resource);
    }

    @DeleteMapping("/{attachmentId}")
    public ResponseEntity<Void> deleteAttachment(@PathVariable Long attachmentId) {
        ticketService.deleteAttachment(attachmentId);
        return ResponseEntity.noContent().build();
    }
}
