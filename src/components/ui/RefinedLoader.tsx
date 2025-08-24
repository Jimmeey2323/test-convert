
import React from 'react';

interface RefinedLoaderProps {
  title?: string;
  subtitle?: string;
}

export const RefinedLoader: React.FC<RefinedLoaderProps> = ({
  title = "Physique 57",
  subtitle = "Loading your dashboard..."
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 flex items-center justify-center relative overflow-hidden">
      {/* Sophisticated Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-200/30 to-purple-200/30 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s' }}></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-purple-200/25 to-indigo-200/25 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s', animationDelay: '3s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-indigo-200/20 to-blue-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '7s', animationDelay: '1.5s' }}></div>
        </div>
      </div>

      {/* Heart Loader */}
      <div className="relative z-10 flex items-center justify-center">
        <div className="cssload-main">
          <div className="cssload-heart">
            <span className="cssload-heartL"></span>
            <span className="cssload-heartR"></span>
            <span className="cssload-square"></span>
          </div>
          <div className="cssload-shadow"></div>
        </div>
      </div>

      {/* Heart Loader Styles */}
      <style>{`
        .cssload-main {
          position: absolute;
          content: '';
          left: 50%;
          transform: translate(-50%, -50%);
          -o-transform: translate(-50%, -50%);
          -ms-transform: translate(-50%, -50%);
          -webkit-transform: translate(-50%, -50%);
          -moz-transform: translate(-50%, -50%);
          scale: 2;
        }

        .cssload-main * {
          font-size: 62px;
        }

        .cssload-heart {
          animation: cssload-heart 2.88s cubic-bezier(0.75, 0, 0.5, 1) infinite normal;
          -o-animation: cssload-heart 2.88s cubic-bezier(0.75, 0, 0.5, 1) infinite normal;
          -ms-animation: cssload-heart 2.88s cubic-bezier(0.75, 0, 0.5, 1) infinite normal;
          -webkit-animation: cssload-heart 2.88s cubic-bezier(0.75, 0, 0.5, 1) infinite normal;
          -moz-animation: cssload-heart 2.88s cubic-bezier(0.75, 0, 0.5, 1) infinite normal;
          top: 50%;
          content: '';
          left: 50%;
          position: absolute;
        }

        .cssload-heartL {
          width: 1em;
          height: 1em;
          border: 1px solid rgb(252, 0, 101);
          background-color: rgb(252, 0, 101);
          content: '';
          position: absolute;
          display: block;
          border-radius: 100%;
          animation: cssload-heartL 2.88s cubic-bezier(0.75, 0, 0.5, 1) infinite normal;
          -o-animation: cssload-heartL 2.88s cubic-bezier(0.75, 0, 0.5, 1) infinite normal;
          -ms-animation: cssload-heartL 2.88s cubic-bezier(0.75, 0, 0.5, 1) infinite normal;
          -webkit-animation: cssload-heartL 2.88s cubic-bezier(0.75, 0, 0.5, 1) infinite normal;
          -moz-animation: cssload-heartL 2.88s cubic-bezier(0.75, 0, 0.5, 1) infinite normal;
          transform: translate(-28px, -27px);
          -o-transform: translate(-28px, -27px);
          -ms-transform: translate(-28px, -27px);
          -webkit-transform: translate(-28px, -27px);
          -moz-transform: translate(-28px, -27px);
        }

        .cssload-heartR {
          width: 1em;
          height: 1em;
          border: 1px solid rgb(252, 0, 101);
          background-color: rgb(252, 0, 101);
          content: '';
          position: absolute;
          display: block;
          border-radius: 100%;
          transform: translate(28px, -27px);
          -o-transform: translate(28px, -27px);
          -ms-transform: translate(28px, -27px);
          -webkit-transform: translate(28px, -27px);
          -moz-transform: translate(28px, -27px);
          animation: cssload-heartR 2.88s cubic-bezier(0.75, 0, 0.5, 1) infinite normal;
          -o-animation: cssload-heartR 2.88s cubic-bezier(0.75, 0, 0.5, 1) infinite normal;
          -ms-animation: cssload-heartR 2.88s cubic-bezier(0.75, 0, 0.5, 1) infinite normal;
          -webkit-animation: cssload-heartR 2.88s cubic-bezier(0.75, 0, 0.5, 1) infinite normal;
          -moz-animation: cssload-heartR 2.88s cubic-bezier(0.75, 0, 0.5, 1) infinite normal;
        }

        .cssload-square {
          width: 1em;
          height: 1em;
          border: 1px solid rgb(252, 0, 101);
          background-color: rgb(252, 0, 101);
          position: relative;
          display: block;
          content: '';
          transform: scale(1) rotate(-45deg);
          -o-transform: scale(1) rotate(-45deg);
          -ms-transform: scale(1) rotate(-45deg);
          -webkit-transform: scale(1) rotate(-45deg);
          -moz-transform: scale(1) rotate(-45deg);
          animation: cssload-square 2.88s cubic-bezier(0.75, 0, 0.5, 1) infinite normal;
          -o-animation: cssload-square 2.88s cubic-bezier(0.75, 0, 0.5, 1) infinite normal;
          -ms-animation: cssload-square 2.88s cubic-bezier(0.75, 0, 0.5, 1) infinite normal;
          -webkit-animation: cssload-square 2.88s cubic-bezier(0.75, 0, 0.5, 1) infinite normal;
          -moz-animation: cssload-square 2.88s cubic-bezier(0.75, 0, 0.5, 1) infinite normal;
        }

        .cssload-shadow {
          top: 97px;
          left: 50%;
          content: '';
          position: relative;
          display: block;
          bottom: -.5em;
          width: 1em;
          height: .24em;
          background-color: rgb(215,215,215);
          border: 1px solid rgb(215,215,215);
          border-radius: 50%;
          animation: cssload-shadow 2.88s cubic-bezier(0.75, 0, 0.5, 1) infinite normal;
          -o-animation: cssload-shadow 2.88s cubic-bezier(0.75, 0, 0.5, 1) infinite normal;
          -ms-animation: cssload-shadow 2.88s cubic-bezier(0.75, 0, 0.5, 1) infinite normal;
          -webkit-animation: cssload-shadow 2.88s cubic-bezier(0.75, 0, 0.5, 1) infinite normal;
          -moz-animation: cssload-shadow 2.88s cubic-bezier(0.75, 0, 0.5, 1) infinite normal;
        }

        @keyframes cssload-square {
          50% {
            border-radius: 100%;
            transform: scale(0.5) rotate(-45deg);
          }
          100% {
            transform: scale(1) rotate(-45deg);
          }
        }

        @-o-keyframes cssload-square {
          50% {
            border-radius: 100%;
            -o-transform: scale(0.5) rotate(-45deg);
          }
          100% {
            -o-transform: scale(1) rotate(-45deg);
          }
        }

        @-ms-keyframes cssload-square {
          50% {
            border-radius: 100%;
            -ms-transform: scale(0.5) rotate(-45deg);
          }
          100% {
            -ms-transform: scale(1) rotate(-45deg);
          }
        }

        @-webkit-keyframes cssload-square {
          50% {
            border-radius: 100%;
            -webkit-transform: scale(0.5) rotate(-45deg);
          }
          100% {
            -webkit-transform: scale(1) rotate(-45deg);
          }
        }

        @-moz-keyframes cssload-square {
          50% {
            border-radius: 100%;
            -moz-transform: scale(0.5) rotate(-45deg);
          }
          100% {
            -moz-transform: scale(1) rotate(-45deg);
          }
        }

        @keyframes cssload-heart {
          50% {
            transform: rotate(360deg);
          }
          100% {
            transform: rotate(720deg);
          }
        }

        @-o-keyframes cssload-heart {
          50% {
            -o-transform: rotate(360deg);
          }
          100% {
            -o-transform: rotate(720deg);
          }
        }

        @-ms-keyframes cssload-heart {
          50% {
            -ms-transform: rotate(360deg);
          }
          100% {
            -ms-transform: rotate(720deg);
          }
        }

        @-webkit-keyframes cssload-heart {
          50% {
            -webkit-transform: rotate(360deg);
          }
          100% {
            -webkit-transform: rotate(720deg);
          }
        }

        @-moz-keyframes cssload-heart {
          50% {
            -moz-transform: rotate(360deg);
          }
          100% {
            -moz-transform: rotate(720deg);
          }
        }

        @keyframes cssload-heartL {
          60% {
            transform: scale(0.4);
          }
        }

        @-o-keyframes cssload-heartL {
          60% {
            -o-transform: scale(0.4);
          }
        }

        @-ms-keyframes cssload-heartL {
          60% {
            -ms-transform: scale(0.4);
          }
        }

        @-webkit-keyframes cssload-heartL {
          60% {
            -webkit-transform: scale(0.4);
          }
        }

        @-moz-keyframes cssload-heartL {
          60% {
            -moz-transform: scale(0.4);
          }
        }

        @keyframes cssload-heartR {
          40% {
            transform: scale(0.4);
          }
        }

        @-o-keyframes cssload-heartR {
          40% {
            -o-transform: scale(0.4);
          }
        }

        @-ms-keyframes cssload-heartR {
          40% {
            -ms-transform: scale(0.4);
          }
        }

        @-webkit-keyframes cssload-heartR {
          40% {
            -webkit-transform: scale(0.4);
          }
        }

        @-moz-keyframes cssload-heartR {
          40% {
            -moz-transform: scale(0.4);
          }
        }

        @keyframes cssload-shadow {
          50% {
            transform: scale(0.5);
            border-color: rgb(228,228,228);
          }
        }

        @-o-keyframes cssload-shadow {
          50% {
            -o-transform: scale(0.5);
            border-color: rgb(228,228,228);
          }
        }

        @-ms-keyframes cssload-shadow {
          50% {
            -ms-transform: scale(0.5);
            border-color: rgb(228,228,228);
          }
        }

        @-webkit-keyframes cssload-shadow {
          50% {
            -webkit-transform: scale(0.5);
            border-color: rgb(228,228,228);
          }
        }

        @-moz-keyframes cssload-shadow {
          50% {
            -moz-transform: scale(0.5);
            border-color: rgb(228,228,228);
          }
        }
      `}</style>
    </div>
  );
};
