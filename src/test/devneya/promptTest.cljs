(ns devneya.promptTest
  (:require [cljs.test :refer-macros [deftest is testing async]]
            [devneya.prompt :as prompt]
            [devneya.promptSpec :as p-spec]
            [failjure.core :as f]
            [cljs.core.async :refer [go >! <! chan]]))

(def hello-world-returner
  (let [n (atom 0)
        output-channel (chan)]
    (with-meta
      (fn []
        (swap! n inc)
        (go (>! output-channel "console.log(\"Hello, world!\");"))
        output-channel)
      {::call-count (fn [] @n)})))

(def wrong-returner
  (let [n (atom 0)
        output-channel (chan)]
    (with-meta
      (fn []
        (swap! n inc)
        (go (>! output-channel "There is no code!"))
        output-channel)
      {::call-count (fn [] @n)})))

(deftest make-correct-prompt-test
  (testing "Got correct code from the first call."
    (let [res-chan (prompt/generate-code
                    (reify p-spec/Icode-generator
                      (request-initial [_ _ _]
                        (hello-world-returner))
                      (request-fix [_ _ _ _]
                        (hello-world-returner)))
                    p-spec/js-eval-description
                    3
                    "")]
      (async done
             (go
               (is (= (<! res-chan) "console.log(\"Hello, world!\");"))
               (is (= ((::call-count (meta hello-world-returner))) 1))
               (done))))))
  
(deftest make-incorrect-prompt-test
  (testing "Never got correct code."
    (let [res-chan (prompt/generate-code
                    (reify p-spec/Icode-generator
                      (request-initial [_ _ _]
                        (wrong-returner))
                      (request-fix [_ _ _ _]
                        (wrong-returner)))
                    p-spec/js-eval-description
                    3
                    "")]
      (async done
             (go
               (is (f/failed? (<! res-chan)))
               (is (= ((::call-count (meta wrong-returner))) 3))
               (done))))))