package ms.joinsounds.joinsounds_backend.controller;

import ms.joinsounds.joinsounds_backend.service.FileStorageService;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
public class FileUploadController {

    private final FileStorageService _fileStorageService;

    public FileUploadController(FileStorageService fileStorageService) {
        this._fileStorageService = fileStorageService;
    }

    @PostMapping("/authenticated/file/upload")
    public ResponseEntity<String> uploadfile(@RequestParam("file") MultipartFile file) {
        // Dodatkowa walidacja typu MIME
        if (!file.getContentType().startsWith("audio/")) {
            return ResponseEntity.badRequest().body("Only audio files are allowed");
        }

        String fileName = _fileStorageService.storeFile(file);
        return ResponseEntity.ok(fileName);
    }

    @GetMapping("/public/file/{filename:.+}")
    public ResponseEntity<Resource> getFile(@PathVariable String filename) {
        try {
            Resource file = _fileStorageService.loadFile(filename);
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(determineContentType(filename)))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + file.getFilename() + "\"")
                    .body(file);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    private String determineContentType(String filename) {
        String extension = filename.substring(filename.lastIndexOf(".")).toLowerCase();
        switch (extension) {
            case ".mp3": return "audio/mpeg";
            case ".wav": return "audio/wav";
            case ".ogg": return "audio/ogg";
            case ".m4a": return "audio/mp4";
            case ".flac": return "audio/flac";
            case ".aac": return "audio/aac";
            case ".opus": return "audio/opus";
            default: return "application/octet-stream";
        }
    }
}
