package com.unipulse.backend.service.impl;

import com.unipulse.backend.dto.AttachmentResponse;
import com.unipulse.backend.exception.ResourceNotFoundException;
import com.unipulse.backend.model.Ticket;
import com.unipulse.backend.model.TicketAttachment;
import com.unipulse.backend.repository.TicketAttachmentRepository;
import com.unipulse.backend.repository.TicketRepository;
import com.unipulse.backend.service.TicketAttachmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TicketAttachmentServiceImpl implements TicketAttachmentService {

    private final TicketAttachmentRepository ticketAttachmentRepository;
    private final TicketRepository ticketRepository;

    @Value("${file.upload-dir}")
    private String uploadDir;

    @Override
    public AttachmentResponse uploadAttachment(Long ticketId, MultipartFile file) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + ticketId));

        try {
            Path uploadPath = Paths.get(uploadDir);
            Files.createDirectories(uploadPath);

            String uniqueFileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path filePath = uploadPath.resolve(uniqueFileName);

            Files.write(filePath, file.getBytes());

            TicketAttachment attachment = TicketAttachment.builder()
                    .fileName(file.getOriginalFilename())
                    .fileType(file.getContentType())
                    .filePath(filePath.toString())
                    .ticket(ticket)
                    .build();

            TicketAttachment savedAttachment = ticketAttachmentRepository.save(attachment);
            return mapToResponse(savedAttachment);

        } catch (IOException e) {
            throw new RuntimeException("Failed to upload attachment: " + e.getMessage());
        }
    }

    @Override
    public List<AttachmentResponse> getAttachmentsByTicketId(Long ticketId) {
        if (!ticketRepository.existsById(ticketId)) {
            throw new ResourceNotFoundException("Ticket not found with id: " + ticketId);
        }

        return ticketAttachmentRepository.findByTicketId(ticketId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public void deleteAttachment(Long attachmentId) {
        TicketAttachment attachment = ticketAttachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Attachment not found with id: " + attachmentId));

        try {
            Path path = Paths.get(attachment.getFilePath());
            Files.deleteIfExists(path);
        } catch (IOException e) {
            throw new RuntimeException("Failed to delete file: " + e.getMessage());
        }

        ticketAttachmentRepository.delete(attachment);
    }

    private AttachmentResponse mapToResponse(TicketAttachment attachment) {
        return AttachmentResponse.builder()
                .id(attachment.getId())
                .fileName(attachment.getFileName())
                .fileType(attachment.getFileType())
                .filePath(attachment.getFilePath())
                .uploadedAt(attachment.getUploadedAt())
                .build();
    }
}
