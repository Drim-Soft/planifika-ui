package com.projectsapi.projectsapi.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.projectsapi.projectsapi.model.Phase;
import com.projectsapi.projectsapi.model.PhaseStatus;
import com.projectsapi.projectsapi.model.Project;
import com.projectsapi.projectsapi.service.PhaseService;
import com.projectsapi.projectsapi.repository.PhaseRepository;
import com.projectsapi.projectsapi.repository.PhaseStatusRepository;
import com.projectsapi.projectsapi.repository.ProjectRepository;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/phases") // ✅ Actualizado para coincidir con el frontend
public class PhaseController {

    @Autowired
    private PhaseService phaseService;

    @Autowired
    private PhaseStatusRepository phaseStatusRepository;

    @Autowired
    private PhaseRepository phaseRepository;

    @Autowired
    private ProjectRepository projectRepository;

    // =====================================================
    // GET ALL PHASES
    // =====================================================
    @GetMapping
    public List<Phase> getAllPhases() {
        return phaseService.getAllPhases();
    }
    
    // =====================================================
    // GET ALL ACTIVE PHASES
    // =====================================================
    @GetMapping("/active")
    public ResponseEntity<List<Phase>> getAllActivePhases() {
        List<Phase> phases = phaseService.getAllActivePhases();
        return ResponseEntity.ok(phases);
    }
    
    // =====================================================
    // GET PHASE BY ID
    // =====================================================
    @GetMapping("/{id}")
    public ResponseEntity<Phase> getPhaseById(@PathVariable Integer id) {
        Optional<Phase> phase = phaseService.getPhaseById(id);
        return phase.map(ResponseEntity::ok)
                    .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // =====================================================
    // GET PHASES BY PROJECT
    // =====================================================
    @GetMapping("/project/{projectId}")
    public List<Phase> getPhasesByProject(@PathVariable Integer projectId) {
        return phaseService.getPhasesByProject(projectId);
    }

    // =====================================================
    // CREATE PHASE
    // =====================================================
    @PostMapping
    public ResponseEntity<?> createPhase(@RequestBody Phase phase) {
        try {
            // 🔹 Validar que los IDs transitorios existan
            if (phase.getIDProjectRef() == null) {
                return ResponseEntity.badRequest().body("Project ID is required");
            }

            if (phase.getIDPhaseStatusRef() == null) {
                return ResponseEntity.badRequest().body("PhaseStatus ID is required");
            }

            // 🔹 Buscar proyecto
            Optional<Project> projectOpt = projectRepository.findById(phase.getIDProjectRef());
            if (projectOpt.isEmpty()) {
                return ResponseEntity.badRequest().body("Project not found with ID " + phase.getIDProjectRef());
            }

            // 🔹 Buscar estado de fase
            Optional<PhaseStatus> statusOpt = phaseStatusRepository.findById(phase.getIDPhaseStatusRef());
            if (statusOpt.isEmpty()) {
                return ResponseEntity.badRequest().body("PhaseStatus not found with ID " + phase.getIDPhaseStatusRef());
            }

            // 🔹 Asignar referencias válidas
            phase.setProject(projectOpt.get());
            phase.setPhaseStatus(statusOpt.get());

            // 🔹 Guardar la fase
            Phase savedPhase = phaseRepository.save(phase);

            return ResponseEntity.ok(savedPhase);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error creating phase: " + e.getMessage());
        }
    }

    // =====================================================
    // UPDATE PHASE
    // =====================================================
    @PutMapping("/{id}")
    public ResponseEntity<?> updatePhase(@PathVariable Integer id, @RequestBody Phase phase) {
        try {
            Phase updated = phaseService.updatePhase(id, phase);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // =====================================================
    // DELETE PHASE (BORRADO LÓGICO)
    // =====================================================
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePhase(@PathVariable Integer id) {
        try {
            phaseService.deletePhase(id);
            return ResponseEntity.ok("✅ Phase logically deleted (status set to 'Eliminada')");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("❌ " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("⚠️ Error deleting phase: " + e.getMessage());
        }
    }
}
