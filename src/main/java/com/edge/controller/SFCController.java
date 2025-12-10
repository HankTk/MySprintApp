package com.edge.controller;

/**
 * @author Hidenori Takaku
 */
import com.edge.entity.SFC;
import com.edge.service.SFCService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Component
@RestController
@RequestMapping("/api/sfcs")
public class SFCController {

    @Autowired
    private SFCService sfcService;

    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8")
    public List<SFC> getAllSFCs() {
        return sfcService.getAllSFCs();
    }

    @GetMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8")
    public ResponseEntity<SFC> getSFCById(@PathVariable String id) {
        return sfcService.getSFCById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping(value = "/rma/{rmaId}", produces = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8")
    public List<SFC> getSFCsByRMAId(@PathVariable String rmaId) {
        return sfcService.getSFCsByRMAId(rmaId);
    }

    @GetMapping(value = "/status/{status}", produces = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8")
    public List<SFC> getSFCsByStatus(@PathVariable String status) {
        return sfcService.getSFCsByStatus(status);
    }

    @PostMapping(value = "/from-rma/{rmaId}", produces = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8")
    public ResponseEntity<SFC> createSFCFromRMA(@PathVariable String rmaId) {
        try {
            SFC sfc = sfcService.createSFCFromRMA(rmaId);
            return ResponseEntity.ok(sfc);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8")
    public SFC createSFC(@RequestBody SFC sfc) {
        return sfcService.createSFC(sfc);
    }

    @PutMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8")
    public ResponseEntity<SFC> updateSFC(@PathVariable String id, @RequestBody SFC sfcDetails) {
        try {
            SFC updatedSFC = sfcService.updateSFC(id, sfcDetails);
            return ResponseEntity.ok(updatedSFC);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSFC(@PathVariable String id) {
        try {
            sfcService.deleteSFC(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}

