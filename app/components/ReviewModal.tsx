"use client";
import { useState } from "react";
import { createReview } from "@/app/lib/api/reviews";
import { useTranslation } from "@/app/hooks/useTranslation";
import { toast } from "sonner";

interface ReviewModalProps {
  bookingId: number;
  driverName: string;
  tripRoute: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReviewModal({
  bookingId,
  driverName,
  tripRoute,
  onClose,
  onSuccess,
}: ReviewModalProps) {
  const { t } = useTranslation();
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      setError(t("page.myBookings.reviewModal.ratingRequired") || "Por favor selecciona una calificación");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await createReview(bookingId, {
        rating,
        comment: comment.trim() || undefined,
      });
      
      toast.success(t("page.myBookings.reviewModal.success") || "¡Reseña creada exitosamente!");
      onSuccess();
    } catch (error: any) {
      console.error("Error creating review:", error);
      setError(error?.message || t("page.myBookings.reviewModal.error") || "Error al crear la reseña");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = () => {
    return (
      <div className="flex items-center gap-2 justify-center my-6">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
            className="transition-transform hover:scale-110"
          >
            <svg
              className={`w-12 h-12 ${
                star <= (hoveredRating || rating)
                  ? "text-yellow-400 fill-current"
                  : "text-gray-300"
              }`}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold text-gray-900">
            {t("page.myBookings.reviewModal.title") || "Calificar viaje"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-1">
            {t("page.myBookings.reviewModal.driver") || "Conductor"}:
          </p>
          <p className="font-semibold text-gray-900">{driverName}</p>
        </div>

        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-1">
            {t("page.myBookings.reviewModal.route") || "Ruta"}:
          </p>
          <p className="font-medium text-gray-900">{tripRoute}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
              {t("page.myBookings.reviewModal.ratingLabel") || "¿Cómo fue tu experiencia?"}
            </label>
            {renderStars()}
            {rating > 0 && (
              <p className="text-center text-sm text-gray-600">
                {rating === 1 && (t("page.myBookings.reviewModal.rating1") || "Muy malo")}
                {rating === 2 && (t("page.myBookings.reviewModal.rating2") || "Malo")}
                {rating === 3 && (t("page.myBookings.reviewModal.rating3") || "Regular")}
                {rating === 4 && (t("page.myBookings.reviewModal.rating4") || "Bueno")}
                {rating === 5 && (t("page.myBookings.reviewModal.rating5") || "Excelente")}
              </p>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("page.myBookings.reviewModal.commentLabel") || "Comentario (opcional)"}
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t("page.myBookings.reviewModal.commentPlaceholder") || "Cuéntanos más sobre tu experiencia..."}
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">
              {comment.length}/500 {t("page.myBookings.reviewModal.characters") || "caracteres"}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              {t("page.myBookings.reviewModal.cancel") || "Cancelar"}
            </button>
            <button
              type="submit"
              disabled={isSubmitting || rating === 0}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSubmitting
                ? (t("page.myBookings.reviewModal.submitting") || "Enviando...")
                : (t("page.myBookings.reviewModal.submit") || "Enviar reseña")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
