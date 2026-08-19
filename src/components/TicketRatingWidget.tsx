import React, { useState } from 'react';
import { Star, Lock, CheckCircle2, MessageSquareHeart, Sparkles, Send, HelpCircle } from 'lucide-react';
import { Ticket } from '../types';
import { useApp } from '../context/AppContext';

interface TicketRatingWidgetProps {
  ticket: Ticket;
  variant?: 'inline' | 'card' | 'badge-only';
  onRatingSubmitted?: (rating: number, feedback?: string) => void;
  showFeedbackInput?: boolean;
}

export const TicketRatingWidget: React.FC<TicketRatingWidgetProps> = ({
  ticket,
  variant = 'inline',
  onRatingSubmitted,
  showFeedbackInput = true
}) => {
  const { rateTicket, currentUser } = useApp();
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [selectedRating, setSelectedRating] = useState<number>(ticket.rating || 0);
  const [feedbackText, setFeedbackText] = useState<string>(ticket.feedback || '');
  const [isOpenPopover, setIsOpenPopover] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [justSubmitted, setJustSubmitted] = useState<boolean>(false);

  const isResolvedOrClosed = ticket.status === 'Resolved' || ticket.status === 'Closed';
  const hasRating = !!(ticket.rating && ticket.rating > 0);
  const isLocked = hasRating;

  // Quick preset feedback remarks
  const quickTags = [
    'Quick Resolution',
    'Specialist was very helpful',
    'Issue completely resolved',
    'Polite & clear communication',
    'Required follow-up'
  ];

  const ratingDescriptions: Record<number, { label: string; color: string }> = {
    1: { label: '1 - Unsatisfactory', color: 'text-red-500' },
    2: { label: '2 - Needs Improvement', color: 'text-orange-500' },
    3: { label: '3 - Satisfactory', color: 'text-yellow-600' },
    4: { label: '4 - Very Good', color: 'text-lime-600' },
    5: { label: '5 - Outstanding / Excellent!', color: 'text-emerald-600' }
  };

  const handleStarClick = (e: React.MouseEvent, star: number) => {
    e.stopPropagation();
    if (isLocked) return;
    setSelectedRating(star);
    setIsOpenPopover(true);
  };

  const handleSubmitRating = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (isLocked) return;
    if (selectedRating < 1) return;

    setIsSubmitting(true);
    try {
      await rateTicket(ticket.id, selectedRating, feedbackText.trim() || undefined);
      setJustSubmitted(true);
      setIsOpenPopover(false);
      if (onRatingSubmitted) {
        onRatingSubmitted(selectedRating, feedbackText.trim() || undefined);
      }
    } catch (err) {
      console.error('Failed to submit feedback rating:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // If ticket is not resolved/closed, rating is not yet applicable
  if (!isResolvedOrClosed) {
    return null;
  }

  // 1. INLINE VARIANT (For Table Rows in Ticket Directory / Employee Dashboard)
  if (variant === 'inline') {
    if (isLocked || justSubmitted) {
      const activeRating = ticket.rating || selectedRating;
      return (
        <div
          className="inline-flex items-center gap-1.5 px-2 py-1 bg-amber-50/80 border border-amber-200/90 rounded-lg text-xs select-none shadow-2xs group/rating relative"
          title={`Rating Locked: ${activeRating}/5 Stars ${ticket.feedback ? `\n"${ticket.feedback}"` : ''}`}
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center gap-0.5 text-amber-500">
            {[1, 2, 3, 4, 5].map(star => (
              <Star
                key={star}
                className={`w-3 h-3 ${
                  star <= activeRating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'
                }`}
              />
            ))}
          </div>
          <span className="font-extrabold text-amber-900 text-[10px]">
            {activeRating}/5
          </span>
          <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-amber-700 bg-amber-100/80 px-1 py-0.2 rounded border border-amber-300/60 ml-0.5">
            <Lock className="w-2.5 h-2.5" />
            <span>Locked</span>
          </span>
        </div>
      );
    }

    // PENDING FEEDBACK INLINE STATE
    return (
      <div className="relative inline-block" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-1.5">
          {/* Feedback Pending Tag */}
          <span
            onClick={() => setIsOpenPopover(!isOpenPopover)}
            className="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-extrabold text-[10px] rounded-full shadow-2xs cursor-pointer transition-transform hover:scale-105 active:scale-95 animate-pulse"
            title="Click to submit feedback and rate your resolution"
          >
            <Sparkles className="w-2.5 h-2.5" />
            <span>Feedback Pending</span>
          </span>

          {/* 5 Interactive Clickable Stars */}
          <div
            className="flex items-center gap-0.5 bg-white border border-amber-300 px-1.5 py-0.5 rounded-lg shadow-2xs"
            onMouseLeave={() => setHoverRating(0)}
          >
            {[1, 2, 3, 4, 5].map(star => {
              const isFilled = (hoverRating || selectedRating) >= star;
              return (
                <button
                  key={star}
                  type="button"
                  onClick={e => handleStarClick(e, star)}
                  onMouseEnter={() => setHoverRating(star)}
                  className="p-0.5 hover:scale-125 transition-transform cursor-pointer"
                  title={`Rate ${star} Star${star > 1 ? 's' : ''}`}
                >
                  <Star
                    className={`w-3.5 h-3.5 transition-colors ${
                      isFilled
                        ? 'text-amber-400 fill-amber-400 drop-shadow-xs'
                        : 'text-gray-300 hover:text-amber-300'
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Inline Quick Feedback Popover */}
        {isOpenPopover && (
          <div
            className="absolute left-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-amber-300 p-4 z-50 animate-in fade-in zoom-in-95 duration-150"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-100">
              <div className="flex items-center gap-1.5 text-xs font-black text-gray-900">
                <MessageSquareHeart className="w-4 h-4 text-amber-500" />
                <span>Rate Resolution ({ticket.id})</span>
              </div>
              <button
                type="button"
                onClick={() => setIsOpenPopover(false)}
                className="text-gray-400 hover:text-gray-600 text-xs font-bold p-1 rounded-md"
              >
                ✕
              </button>
            </div>

            {/* Interactive Stars Selection in Popover */}
            <div className="text-center py-2 bg-amber-50/60 rounded-xl border border-amber-100 mb-3">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                Your Rating
              </p>
              <div
                className="flex items-center justify-center gap-1.5"
                onMouseLeave={() => setHoverRating(0)}
              >
                {[1, 2, 3, 4, 5].map(star => {
                  const isFilled = (hoverRating || selectedRating) >= star;
                  return (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setSelectedRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      className="p-1 hover:scale-125 transition-transform cursor-pointer"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          isFilled
                            ? 'text-amber-400 fill-amber-400 filter drop-shadow'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
              <p className="text-xs font-extrabold text-amber-800 mt-1">
                {selectedRating > 0
                  ? ratingDescriptions[selectedRating]?.label
                  : 'Select 1 to 5 Stars'}
              </p>
            </div>

            {/* Quick Feedback Tags */}
            <div className="mb-2">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                Quick Tags
              </p>
              <div className="flex flex-wrap gap-1">
                {quickTags.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() =>
                      setFeedbackText(prev => (prev ? `${prev}, ${tag}` : tag))
                    }
                    className="text-[10px] font-semibold bg-gray-100 hover:bg-amber-100 text-gray-700 hover:text-amber-900 px-2 py-0.5 rounded-full transition-colors cursor-pointer"
                  >
                    + {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Remarks Input */}
            <div className="space-y-1 mb-3">
              <label className="text-[10px] font-bold text-gray-500 block">
                Feedback Remarks (Optional)
              </label>
              <textarea
                value={feedbackText}
                onChange={e => setFeedbackText(e.target.value)}
                placeholder="How satisfied were you with the solution provided?"
                rows={2}
                className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:bg-white focus:border-amber-500 transition-all resize-none"
              />
            </div>

            {/* Submit & Lock Button */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsOpenPopover(false)}
                className="flex-1 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitRating}
                disabled={selectedRating < 1 || isSubmitting}
                className="flex-1 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 disabled:opacity-50 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                <Lock className="w-3 h-3" />
                <span>{isSubmitting ? 'Saving...' : 'Submit & Lock'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 2. CARD VARIANT (For Ticket Details Modal & Main Dashboard Overview)
  return (
    <div
      id={`ticket-rating-card-${ticket.id}`}
      className={`rounded-2xl border transition-all ${
        isLocked
          ? 'bg-gradient-to-br from-amber-50/60 to-yellow-50/30 border-amber-200 p-5 shadow-xs'
          : 'bg-white border-amber-300 ring-2 ring-amber-100 p-5 shadow-sm'
      }`}
    >
      {/* Header Banner */}
      <div className="flex items-center justify-between gap-3 mb-3 pb-3 border-b border-gray-100 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              isLocked
                ? 'bg-amber-100 text-amber-700'
                : 'bg-gradient-to-br from-amber-500 to-yellow-500 text-white shadow-xs animate-bounce'
            }`}
          >
            <Star className="w-5 h-5 fill-current" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-gray-900 flex items-center gap-2">
              <span>Service Satisfaction Rating</span>
              {isLocked ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" />
                  <span>Locked & Saved</span>
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-100 text-red-800 border border-red-200 animate-pulse">
                  Feedback Pending
                </span>
              )}
            </h3>
            <p className="text-[11px] text-gray-500">
              {isLocked
                ? 'Feedback has been recorded and locked in central Google Sheets.'
                : 'Ticket has been resolved. Please rate the quality and speed of service.'}
            </p>
          </div>
        </div>

        {isLocked && ticket.rating && (
          <div className="text-right">
            <span className="text-2xl font-black text-amber-600">
              {ticket.rating}
              <span className="text-sm font-bold text-gray-400">/5</span>
            </span>
          </div>
        )}
      </div>

      {/* LOCKED STATE VIEW */}
      {isLocked ? (
        <div className="space-y-3">
          {/* Read-only Star Bar */}
          <div className="p-3.5 bg-white rounded-xl border border-amber-200 flex items-center justify-between flex-wrap gap-2 shadow-2xs">
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map(star => (
                <Star
                  key={star}
                  className={`w-6 h-6 ${
                    star <= (ticket.rating || 0)
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-gray-200'
                  }`}
                />
              ))}
              <span className="font-extrabold text-amber-900 text-xs ml-2">
                {ratingDescriptions[ticket.rating || 5]?.label}
              </span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-gray-400">
              <Lock className="w-3 h-3 text-amber-600" />
              <span>Permanent Record</span>
            </div>
          </div>

          {/* User Feedback Quote */}
          {ticket.feedback && (
            <div className="p-3 bg-white rounded-xl border border-gray-200 text-xs">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                Requester Comments:
              </p>
              <p className="text-gray-800 font-medium italic">
                "{ticket.feedback}"
              </p>
            </div>
          )}
        </div>
      ) : (
        /* INTERACTIVE FEEDBACK SUBMISSION FORM */
        <form onSubmit={handleSubmitRating} className="space-y-4">
          {/* Interactive Star Rating Selector */}
          <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl text-center">
            <p className="text-xs font-bold text-gray-700 mb-2">
              Select your rating from 1 to 5 Stars:
            </p>
            <div
              className="flex items-center justify-center gap-2"
              onMouseLeave={() => setHoverRating(0)}
            >
              {[1, 2, 3, 4, 5].map(star => {
                const isFilled = (hoverRating || selectedRating) >= star;
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setSelectedRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    className="p-1 hover:scale-125 transition-transform cursor-pointer group"
                    title={`Rate ${star} Star${star > 1 ? 's' : ''}`}
                  >
                    <Star
                      className={`w-8 h-8 transition-colors ${
                        isFilled
                          ? 'text-amber-400 fill-amber-400 drop-shadow-md'
                          : 'text-gray-300 group-hover:text-amber-300'
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            <p className="text-xs font-black text-amber-900 mt-2">
              {selectedRating > 0
                ? ratingDescriptions[selectedRating]?.label
                : 'Click any star to choose your rating'}
            </p>
          </div>

          {/* Quick Tag Recommendations */}
          <div>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
              Quick Highlights:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {quickTags.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() =>
                    setFeedbackText(prev => (prev ? `${prev}, ${tag}` : tag))
                  }
                  className="text-xs font-medium bg-gray-100 hover:bg-amber-100 text-gray-700 hover:text-amber-900 px-2.5 py-1 rounded-full border border-gray-200 transition-colors cursor-pointer"
                >
                  + {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Feedback Remarks */}
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">
              Feedback Remarks / Suggestions:
            </label>
            <textarea
              value={feedbackText}
              onChange={e => setFeedbackText(e.target.value)}
              placeholder="Tell us what went well or how we can improve..."
              rows={3}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium outline-none focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all resize-none"
            />
          </div>

          {/* Submit & Lock Button */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-gray-400 flex items-center gap-1 font-medium">
              <Lock className="w-3 h-3 text-amber-600" />
              <span>Feedback locks permanently once submitted.</span>
            </span>

            <button
              type="submit"
              disabled={selectedRating < 1 || isSubmitting}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 disabled:opacity-50 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>
                {isSubmitting
                  ? 'Saving to Sheets...'
                  : selectedRating > 0
                  ? `Submit & Lock Rating (★ ${selectedRating}/5)`
                  : 'Select Stars to Submit'}
              </span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
