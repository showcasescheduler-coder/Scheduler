import React from "react";

interface SourceBadgeProps {
  type: string; // This will be the routineId
}

const SourceBadge: React.FC<SourceBadgeProps> = ({ type }) => {
  return (
    <span
      className="
        inline-flex 
        items-center 
        rounded-md 
        px-2 
        py-1 
        text-xs 
        font-medium
        bg-amber-50
        text-amber-700
        border 
        border-amber-100
      "
    >
      Regular Routine
    </span>
  );
};

export default SourceBadge;

// import React from "react";

// interface SourceBadgeProps {
//   isEvent?: boolean;
//   isRoutine?: boolean;
//   eventId?: string | null;
//   routineId?: string | null;
// }

// const SourceBadge: React.FC<SourceBadgeProps> = ({
//   isEvent,
//   isRoutine,
//   eventId,
//   routineId,
// }) => {
//   if (!isEvent && !isRoutine) return null;

//   const getBadgeStyles = () => {
//     if (isEvent) {
//       return {
//         bg: eventId ? "bg-purple-50" : "bg-purple-50/50",
//         text: eventId ? "text-purple-700" : "text-purple-500",
//         border: eventId ? "border-purple-100" : "border-purple-100/50",
//       };
//     }
//     if (isRoutine) {
//       return {
//         bg: routineId ? "bg-amber-50" : "bg-amber-50/50",
//         text: routineId ? "text-amber-700" : "text-amber-500",
//         border: routineId ? "border-amber-100" : "border-amber-100/50",
//       };
//     }
//     // Default styles if somehow neither condition is met
//     return {
//       bg: "bg-gray-50",
//       text: "text-gray-700",
//       border: "border-gray-100",
//     };
//   };

//   const styles = getBadgeStyles();

//   return (
//     <span
//       className={`
//         inline-flex
//         items-center
//         rounded-md
//         px-2
//         py-1
//         text-xs
//         font-medium
//         ${styles.bg}
//         ${styles.text}
//         border
//         ${styles.border}
//       `}
//     >
//       {isEvent && (eventId ? "Scheduled Event" : "Custom Event")}
//       {isRoutine && (routineId ? "Regular Routine" : "Custom Routine")}
//     </span>
//   );
// };

// export default SourceBadge;
