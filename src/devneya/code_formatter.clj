(ns devneya.code_formatter
  (:require [failjure.core :as f]
            [clojure.string :as clstr]))

;; (defn remove-triple-back-quote 
;;   "Removes triple back quote
;;    ```(\w+)?[\r\n]+ matches line with opening triple back quote and language name
;;    ([\s\S]+?) matches text between quotes (if exists)
;;    [\r\n]+``` line with closing triple back quote
;;    ([\s\S]+?[\r\n]+```)? matches text after closing quotes and next opening quotes (if exists)"
;;   [stri] 
;;   (let [re-match (re-pattern "```(\\w+)?(\\r)?\\n([\\s\\S]+?)(\\r)?\\n```([\\s\\S]+?(\\r)?\\n```)?"),
;;         matched (re-find re-match stri),
;;         index-of-matched 0,
;;         index-of-inner-part 2,
;;         index-of-next-quotes 3]
;;   (print (clstr/replace stri (get matched index-of-matched)
;;                         (str (get matched index-of-inner-part)
;;                              (if (= (get matched index-of-next-quotes) nil)
;;                                ""
;;                                "\n```"))))))

;; (defn find-first-block
;;   "Function uses regexp to find first block in triple back quotes"
;;   [stri]
;;   (let [re-match-block (re-pattern "```(\\w+)?(\\r)?\\n([\\s\\S]+?)(\\r)?\\n```"),
;;         matched-data (re-find re-match-block stri),
;;         index-of-matched-block 0,
;;         index-of-block-inner-part 2]
;;     ;; (print matched-data) ;; used to know required indexes
;;     (get matched-data index-of-block-inner-part)))

(defn filter-by-index-parity [lst parity]
  (->> lst
       (map #(vector %1 %2) (range))
       (filter #(= (mod (first %) 2) parity))
       (map second)))

(defn remove-triple-back-quote
  "Function uses regexp to find first block in triple back quotes"
  [stri merge]
  (let [re-match-quotes (re-pattern "(```(\\w+)?(\\r)?\\n)")
        re-match-quotes-end (re-pattern "((\\r)?\\n```(\\w+)?)")
        ;; Splitting by triple quotes with \n after them
        splitted-stri (clstr/split stri re-match-quotes)
        ;; Splitting by triple quotes with \n before them
        splitted-stri-final (flatten (map #(clstr/split % re-match-quotes-end) splitted-stri))
        ;; If we have at least one pair of ```, index of first block inside them after split is 1
        ;; If we do not have any ```, index of only block is 0
        blocks (if (> (count splitted-stri-final) 1) (filter-by-index-parity splitted-stri-final 1) splitted-stri-final)]
    ;; Numbe of elements in splitted-stri-final should be odd, otherwise we have one ``` without pair
    ;; I am not shure that it is a good idea to check it
    (if (= merge 1)
      (clstr/join blocks)
      (if (> (count blocks) 1)
        (f/fail "chatGPT splitted the code to multiple blocks, try to simplyfy your request")
        (clstr/join blocks)))))