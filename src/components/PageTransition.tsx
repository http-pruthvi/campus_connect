import { motion } from "framer-motion";
import { ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
}

const variants = {
  initial: {
    opacity: 0,
    y: 10,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: 0.2,
    },
  },
};

export default function PageTransition({ children }: PageTransitionProps) {
  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{ width: "100%", height: "100%" }}
    >
      {children}
    </motion.div>
  );
}
