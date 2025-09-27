package ms.joinsounds.joinsounds_backend.controller;

import lombok.RequiredArgsConstructor;
import ms.joinsounds.joinsounds_backend.dto.ReviewDto;
import ms.joinsounds.joinsounds_backend.entity.Review;
import ms.joinsounds.joinsounds_backend.entity.User;
import ms.joinsounds.joinsounds_backend.repository.ReviewRepository;
import ms.joinsounds.joinsounds_backend.repository.UsersRepository;
import ms.joinsounds.joinsounds_backend.service.ReviewService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class ReviewController {
    private final UsersRepository _usersRepository;
    private final ReviewRepository _reviewRepository;
    private final ReviewService _reviewService;

    @PostMapping("/authenticated/review/create")
    public Review createReview(@RequestBody Review reviewRequest) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = authentication.getPrincipal() instanceof User ? (User) authentication.getPrincipal() : null;
        User userAbout = _usersRepository.findById(reviewRequest.getUserAbout().getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Review review = new Review();
        review.setRating(reviewRequest.getRating());
        review.setContent(reviewRequest.getContent());
        review.setUserFrom(user);
        review.setUserAbout(userAbout);

        return _reviewRepository.save(review);
    }

    @GetMapping("public/all/review/about/{userId}")
    public ResponseEntity<Page<ReviewDto>> getAllAbout(
            @PathVariable UUID userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort) {

        User userAbout = _usersRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String[] sortParams = sort.split(",");
        Sort.Direction direction = Sort.Direction.fromString(sortParams[1]);
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortParams[0]));
        Page<Review> reviewsPage = _reviewRepository.findByUserAbout(userAbout, pageable);

        Page<ReviewDto> reviewDtos = _reviewService.getReviewsDtos(reviewsPage);

        return ResponseEntity.ok(reviewDtos);
    }

    @PutMapping("/authenticated/review/update/{reviewId}")
    public Review updateReview(@PathVariable UUID reviewId, @RequestBody Review reviewRequest) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = authentication.getPrincipal() instanceof User ? (User) authentication.getPrincipal() : null;

        Review existingReview = _reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));

        if (!existingReview.getUserFrom().getId().equals(user.getId())) {
            throw new RuntimeException("You can only update your own reviews");
        }

        existingReview.setRating(reviewRequest.getRating());
        existingReview.setContent(reviewRequest.getContent());

        return _reviewRepository.save(existingReview);
    }

    @DeleteMapping("/authenticated/review/delete/{reviewId}")
    public ResponseEntity<Void> deleteReview(@PathVariable UUID reviewId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = authentication.getPrincipal() instanceof User ? (User) authentication.getPrincipal() : null;

        Review existingReview = _reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));

        if (!existingReview.getUserFrom().getId().equals(user.getId()) || user.getRole().equals("ADMIN") || user.getRole().equals("MODERATOR")) {
            throw new RuntimeException("You can only delete your own reviews");
        }

        _reviewRepository.delete(existingReview);
        return ResponseEntity.noContent().build();
    }

}