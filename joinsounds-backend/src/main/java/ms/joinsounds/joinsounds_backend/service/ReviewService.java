package ms.joinsounds.joinsounds_backend.service;

import lombok.RequiredArgsConstructor;
import ms.joinsounds.joinsounds_backend.dto.ReviewDto;
import ms.joinsounds.joinsounds_backend.entity.Review;
import ms.joinsounds.joinsounds_backend.entity.UserProfile;
import ms.joinsounds.joinsounds_backend.repository.UserProfileRepository;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ReviewService {
    private final UserProfileRepository _userProfileRepository;
    public Page<ReviewDto> getReviewsDtos(Page<Review> reviewsPage) {
        return reviewsPage.map(review -> {
            ReviewDto reviewDto = new ReviewDto();
            reviewDto.setId(review.getId());
            reviewDto.setRating(review.getRating());
            reviewDto.setContent(review.getContent());
            reviewDto.setUserAboutId(review.getUserAbout().getId());
            reviewDto.setUserFromUsername(review.getUserFrom().getName());

            UserProfile userFromProfile = _userProfileRepository.findByUser(review.getUserFrom());
            reviewDto.setUserFromProfilePicturePath(userFromProfile.getProfilePicturePath());
            return reviewDto;
        });
    }
}
