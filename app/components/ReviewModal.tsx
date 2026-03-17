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
      <div className="flex items-center gap-2 justify-center my-8">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
            className="transition-all transform hover:scale-125"
          >
            <svg
              className={`w-14 h-14 ${
                star <= (hoveredRating || rating)
                  ? "text-yellow-400 fill-current"
                  : "text-green-100"
              }`}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-green-900/40 backdrop-blur-sm flex items-center justify-center z-[1000] p-4">
      <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-lg w-full p-8 md:p-12 border-2 border-green-50 relative overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-green-300 hover:text-green-500 transition-colors text-3xl font-light"
        >
          ×
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-green-100">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.382-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-green-900">
            {t("page.myBookings.reviewModal.title") || "Calificar viaje"}
          </h2>
        </div>

        <div className="space-y-4 mb-8">
          <div className="bg-green-50 p-4 rounded-2xl border border-green-100 text-center">
            <p className="text-xs font-bold text-green-400 uppercase tracking-widest mb-1">
              PROTAGONISTA
            </p>
            <p className="font-bold text-green-900 text-xl">{driverName}</p>
          </div>

          <div className="bg-green-50 p-4 rounded-2xl border border-green-100 text-center">
            <p className="text-xs font-bold text-green-400 uppercase tracking-widest mb-1">
              MISIÓN
            </p>
            <p className="font-medium text-green-800 italic">{tripRoute}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-8">
            <label className="block text-sm font-bold text-green-700 mb-2 text-center uppercase tracking-widest">
              {t("page.myBookings.reviewModal.ratingLabel") || "¿Cómo fue tu experiencia?"}
            </label>
            {renderStars()}
            {rating > 0 && (
              <p className="text-center text-lg font-bold text-green-600 italic">
                {rating === 1 && (t("page.myBookings.reviewModal.rating1") || "Para olvidar")}
                {rating === 2 && (t("page.myBookings.reviewModal.rating2") || "Mejorable")}
                {rating === 3 && (t("page.myBookings.reviewModal.rating3") || "Correcto")}
                {rating === 4 && (t("page.myBookings.reviewModal.rating4") || "Muy bueno")}
                {rating === 5 && (t("page.myBookings.reviewModal.rating5") || "Excelente")}
              </p>
            )}
          </div>

          <div className="mb-8">
            <label className="block text-sm font-bold text-green-700 mb-3 uppercase tracking-widest">
              {t("page.myBookings.reviewModal.commentLabel") || "Tu mensaje (opcional)"}
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="w-full border-2 border-green-100 rounded-2xl px-5 py-4 text-green-900 focus:outline-none focus:border-green-300 font-medium placeholder:text-green-200 transition-all resize-none"
              placeholder={t("page.myBookings.reviewModal.commentPlaceholder") || "Cuéntanos detalles del viaje..."}
              maxLength={500}
            />
            <div className="flex justify-end mt-2">
              <span className="text-xs font-bold text-green-300">
                {comment.length}/500
              </span>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-100 rounded-2xl">
              <p className="text-red-600 text-sm font-bold">{error}</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-8 py-4 bg-gray-100 text-gray-500 rounded-xl font-bold hover:bg-gray-200 transition-all uppercase tracking-widest text-sm"
              disabled={isSubmitting}
            >
              {t("page.myBookings.reviewModal.cancel") || "Cancelar"}
            </button>
            <button
              type="submit"
              disabled={isSubmitting || rating === 0}
              className="flex-[1.5] btn-primary py-4 text-base"
            >
              {isSubmitting
                ? (t("page.myBookings.reviewModal.submitting") || "ENVIANDO...")
                : (t("page.myBookings.reviewModal.submit") || "PUBLICAR RESEÑA")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
