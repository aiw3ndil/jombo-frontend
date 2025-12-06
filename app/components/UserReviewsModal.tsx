"use client";
import { useEffect, useState } from "react";
import { getUserReviews, Review } from "@/app/lib/api/reviews";
import { useTranslation } from "@/app/hooks/useTranslation";

interface UserReviewsModalProps {
  userId: number;
  userName: string;
  onClose: () => void;
}

export default function UserReviewsModal({
  userId,
  userName,
  onClose,
}: UserReviewsModalProps) {
  const { t } = useTranslation();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const data = await getUserReviews(userId);
        setReviews(data);
      } catch (error: any) {
        console.error("Error fetching reviews:", error);
        setError(error?.message || "Error al cargar las reseñas");
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [userId]);

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-5 h-5 ${
              star <= rating ? "text-yellow-400 fill-current" : "text-gray-300"
            }`}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ))}
      </div>
    );
  };

  const calculateAverageRating = (): string => {
    if (reviews.length === 0) return "0";
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-start p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {t("page.search.reviewsModal.title") || "Reseñas"} - {userName}
            </h2>
            {!loading && reviews.length > 0 && (
              <div className="flex items-center gap-3 mt-2">
                {renderStars(Math.round(parseFloat(calculateAverageRating())))}
                <span className="text-lg font-semibold text-gray-900">
                  {calculateAverageRating()}
                </span>
                <span className="text-sm text-gray-600">
                  ({reviews.length} {reviews.length === 1 
                    ? (t("page.search.reviewsModal.review") || "reseña") 
                    : (t("page.search.reviewsModal.reviews") || "reseñas")})
                </span>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={onClose}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
              >
                {t("page.search.reviewsModal.close") || "Cerrar"}
              </button>
            </div>
          )}

          {!loading && !error && reviews.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">
                {t("page.search.reviewsModal.noReviews") || "Este usuario aún no tiene reseñas"}
              </p>
            </div>
          )}

          {!loading && !error && reviews.length > 0 && (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {review.reviewer?.name || t("page.search.reviewsModal.anonymous") || "Anónimo"}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(review.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    {renderStars(review.rating)}
                  </div>
                  {review.comment && (
                    <p className="text-gray-700 mt-2">{review.comment}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 p-4">
          <button
            onClick={onClose}
            className="w-full bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
          >
            {t("page.search.reviewsModal.close") || "Cerrar"}
          </button>
        </div>
      </div>
    </div>
  );
}
