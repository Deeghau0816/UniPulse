package com.unipulse.backend.service.impl;

import com.unipulse.backend.entity.ResolutionNote;
import com.unipulse.backend.Repository.ResolutionNoteRepository;
import com.unipulse.backend.service.ResolutionNoteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class ResolutionNoteServiceImpl implements ResolutionNoteService {
    
    private final ResolutionNoteRepository resolutionNoteRepository;
    
    @Autowired
    public ResolutionNoteServiceImpl(ResolutionNoteRepository resolutionNoteRepository) {
        this.resolutionNoteRepository = resolutionNoteRepository;
    }
    
    @Override
    public ResolutionNote createResolutionNote(Long ticketId, String notes, String createdBy) {
        ResolutionNote resolutionNote = new ResolutionNote(ticketId, notes, createdBy);
        return resolutionNoteRepository.save(resolutionNote);
    }
    
    @Override
    public ResolutionNote updateResolutionNote(Long id, String notes) {
        Optional<ResolutionNote> resolutionNoteOpt = resolutionNoteRepository.findById(id);
        if (resolutionNoteOpt.isEmpty()) {
            throw new RuntimeException("Resolution note not found with id: " + id);
        }
        
        ResolutionNote resolutionNote = resolutionNoteOpt.get();
        resolutionNote.setNotes(notes);
        return resolutionNoteRepository.save(resolutionNote);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<ResolutionNote> getResolutionNotesByTicketId(Long ticketId) {
        return resolutionNoteRepository.findByTicketIdOrderByCreatedAtDesc(ticketId);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Optional<ResolutionNote> getLatestResolutionNoteByTicketId(Long ticketId) {
        return resolutionNoteRepository.findLatestByTicketId(ticketId);
    }
    
    @Override
    public void deleteResolutionNote(Long id) {
        if (!resolutionNoteRepository.existsById(id)) {
            throw new RuntimeException("Resolution note not found with id: " + id);
        }
        resolutionNoteRepository.deleteById(id);
    }
    
    @Override
    public void deleteResolutionNotesByTicketId(Long ticketId) {
        resolutionNoteRepository.deleteByTicketId(ticketId);
    }
}
