package ms.joinsounds.joinsounds_backend.controller;

import ms.joinsounds.joinsounds_backend.service.FileStorageService;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/authenticated/file")
public class FileUploadController {

    private final FileStorageService _fileStorageService;

    public FileUploadController(FileStorageService fileStorageService) {
        this._fileStorageService = fileStorageService;
    }

    @PostMapping("/upload")
    public ResponseEntity<String> uploadfile(@RequestParam("file") MultipartFile file) {
        // Dodatkowa walidacja typu MIME
        if (!file.getContentType().startsWith("audio/")) {
            return ResponseEntity.badRequest().body("Only audio files are allowed");
        }

        String fileName = _fileStorageService.storeFile(file);
        return ResponseEntity.ok(fileName);
    }

}
