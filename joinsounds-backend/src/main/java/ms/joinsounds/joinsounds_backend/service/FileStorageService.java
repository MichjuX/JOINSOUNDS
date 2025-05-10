package ms.joinsounds.joinsounds_backend.service;

import net.bramp.ffmpeg.FFmpeg;
import net.bramp.ffmpeg.FFmpegExecutor;
import net.bramp.ffmpeg.FFprobe;
import net.bramp.ffmpeg.builder.FFmpegBuilder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
public class FileStorageService {
    private final Path _fileStorageLocation;
    private final FFmpeg ffmpeg;
    private final FFprobe ffprobe;

    public FileStorageService() throws IOException {
        this._fileStorageLocation = Paths.get("./uploads")
                .toAbsolutePath()
                .normalize();
        try {
            Files.createDirectories(this._fileStorageLocation);
        } catch (IOException e) {
            throw new RuntimeException("Can't create directory for file storage", e);
        }

        // Inicjalizacja FFmpeg (upewnij się, że jest zainstalowany w systemie)
        this.ffmpeg = new FFmpeg("ffmpeg");
        this.ffprobe = new FFprobe("ffprobe");
    }

    public String storeFile(MultipartFile file) {
        try {
            if (file.isEmpty()) {
                throw new RuntimeException("File is empty");
            }

            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("audio/")) {
                throw new RuntimeException("Only audio files are allowed");
            }

            String originalFilename = file.getOriginalFilename();
            if (originalFilename == null || !originalFilename.contains(".")) {
                throw new RuntimeException("Invalid file name");
            }

            String fileExtension = originalFilename.substring(originalFilename.lastIndexOf(".")).toLowerCase();

            List<String> allowedExtensions = Arrays.asList(".mp3", ".wav", ".ogg", ".m4a", ".flac", ".aac");
            if (!allowedExtensions.contains(fileExtension)) {
                throw new RuntimeException("Unsupported audio format. Allowed: .mp3, .wav, .ogg, .m4a, .flac, .aac");
            }

            // Zapisz oryginalny plik tymczasowo
            String tempFileName = UUID.randomUUID() + fileExtension;
            Path tempFilePath = this._fileStorageLocation.resolve(tempFileName);
            Files.copy(file.getInputStream(), tempFilePath);

            // Określ czy konwertować plik
            String finalExtension = shouldConvert(fileExtension, file.getSize()) ? ".opus" : fileExtension;
            String finalFileName = UUID.randomUUID() + finalExtension;
            Path finalFilePath = this._fileStorageLocation.resolve(finalFileName);

            if (shouldConvert(fileExtension, file.getSize())) {
                convertAudio(tempFilePath.toString(), finalFilePath.toString(), finalExtension);
                Files.delete(tempFilePath); // Usuń tymczasowy plik
            } else {
                Files.move(tempFilePath, finalFilePath); // Po prostu zmień nazwę
            }

            return finalFileName;
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file", e);
        }
    }

    private boolean shouldConvert(String originalExtension, long fileSize) {
        // Nie konwertuj jeśli plik jest już w formacie OPUS lub AAC
        if (originalExtension.equals(".opus") || originalExtension.equals(".aac")) {
            return false;
        }

        // Konwertuj jeśli plik jest większy niż 5MB (możesz dostosować tę wartość)
        return fileSize > 5 * 1024 * 1024;
    }

    private void convertAudio(String inputPath, String outputPath, String targetExtension) throws IOException {
        FFmpegBuilder builder = new FFmpegBuilder()
                .setInput(inputPath)
                .overrideOutputFiles(true);

        // Dostosuj parametry konwersji w zależności od docelowego formatu
        if (targetExtension.equals(".opus")) {
            builder.addOutput(outputPath)
                    .setAudioCodec("libopus")
                    .setAudioBitRate(96000) // 96 kbps - dobra jakość przy małym rozmiarze
                    .setAudioChannels(2)
                    .setAudioSampleRate(48000)
                    .setStrict(FFmpegBuilder.Strict.EXPERIMENTAL)
                    .done();
        } else {
            // Domyślnie używamy AAC
            builder.addOutput(outputPath)
                    .setAudioCodec("aac")
                    .setAudioBitRate(128000) // 128 kbps
                    .setAudioChannels(2)
                    .setAudioSampleRate(44100)
                    .done();
        }

        FFmpegExecutor executor = new FFmpegExecutor(ffmpeg, ffprobe);
        executor.createJob(builder).run();
    }
}
