import { generateCode, GPTGeneratorBuilder } from "./devneya.js";

class CookieCodeForm {
    container: HTMLDivElement | undefined;
    popupButton: HTMLButtonElement | undefined;
    formTemplate: string;
    observer: MutationObserver | undefined;
    popupButtonContainer: HTMLElement | undefined;
    locatePopupButtonContainer: Function;
    constructor(locatePopupButtonContainer: Function) {
        this.container = undefined;
        this.popupButton = undefined;
        this.locatePopupButtonContainer = locatePopupButtonContainer;
        this.formTemplate = `
        <form class="cookie-code-form">
            <div class="cookie-code-form__close">+</div>
            <label for="" class="cookie-code-form__label" for="cookie-code-form__api-key">API Key:</label>
            <input type="text" class="cookie-code-form__api-key" name="cookie-code-form__api-key" placeholder="API Key" required>
            <label for="" class="cookie-code-form__label" for="cookie-code-form__prompt">Prompt:</label>
            <textarea class="cookie-code-form__prompt" name="cookie-code-form__prompt" placeholder="Prompt" required></textarea>
            <label for="cookie-code-form__languages-dropdown">Choose a language:</label> 
            <select name="cookie-code-form__languages-dropdown" class="cookie-code-form__languages-dropdown"> 
                <option value="JavaScript">JavaScript</option> 
                <option value="TypeScript">TypeScript</option> 
                <option value="Python">Python</option> 
                <option value="Golang">Golang</option> 
                <option value="Bash">Bash</option> 
                <option value="PostgreSQL">PostgreSQL</option> 
            </select>
            <button class="cookie-code-form__submit-button cookie-code-btn">Submit</button>
            <textarea class="cookie-code-form__response" name="cookie-code-form__response"></textarea>
            <button class="cookie-code-form__copy-button cookie-code-btn" type="button">Copy & Close</button>
        </form>
        `;
    }

    changeCookieCodeFormVisibility() {
        this.container
            ?.querySelector("div .cookie-code-form")
            ?.classList.toggle("active");
    }

    mutationCallback() {
        this.popupButtonContainer = this.locatePopupButtonContainer()
        if (
            !document.querySelector("cookie-code-popup-button") &&
            this.popupButtonContainer
        ) {
            this.renderPopupButton(this.popupButtonContainer)
        }
    }

    injectFormInContainer(container: HTMLElement | undefined) {
        if (container) {
            container.innerHTML = this.formTemplate;
        } else if (this.container) {
            this.container.innerHTML = this.formTemplate;
        }
    }
    renderPopupButton(container:HTMLElement){
        this.popupButton = <HTMLButtonElement>document.createElement("button");
        this.popupButton.classList.add("cookie-code-btn", "cookie-code-popup-button")
        this.popupButton.innerText = "Cookie Code"
        container.appendChild(this.popupButton);
        this.popupButton.addEventListener(
            "click",() => {
                this.changeCookieCodeFormVisibility()
            }
            
        );
    }

    injectPopupButton(mutationCallback: MutationCallback) {
        this.popupButtonContainer = this.locatePopupButtonContainer()
        if (this.popupButtonContainer) {
            this.renderPopupButton(this.popupButtonContainer)
        } else {
            this.observer = new MutationObserver(mutationCallback);
            this.observer.observe(document.body, { childList: true, subtree: true });
        }
    }

    renderFormContainer() {
        this.container = <HTMLDivElement>document.createElement("div");
        this.container.classList.add("cookie-code-container");
        document.body.appendChild(this.container);
    }

    addListeners() {
        const apiKey = <HTMLInputElement>(
            document.querySelector(".cookie-code-form__api-key")!
        );
        const prompt = <HTMLTextAreaElement>(
            document.querySelector(".cookie-code-form__prompt")!
        );
        const response = <HTMLSelectElement>(
            document.querySelector(".cookie-code-form__response")!
        );
        const lang = <HTMLTextAreaElement>(
            document.querySelector(".cookie-code-form__languages-dropdown")!
        );
        this.container
            ?.querySelector(".cookie-code-form__close")
            ?.addEventListener("click", this.changeCookieCodeFormVisibility);
        this.container
            ?.querySelector(".cookie-code-form__copy-button")
            ?.addEventListener("click", () => {
                navigator.clipboard.writeText(
                    (<HTMLTextAreaElement>(
                        this.container?.querySelector(".cookie-code-form__response")
                    )).value
                );
                this.changeCookieCodeFormVisibility();
            });
        this.container
            ?.querySelector(".cookie-code-form__submit-button")
            ?.addEventListener("click", function (event) {
                response.value = "";
                event.preventDefault();

                (async () => {
                    let devneyaResponse = await generateCode(
                        GPTGeneratorBuilder(apiKey.value),
                        lang.value,
                        3,
                        prompt.value
                    );
                    response.value = devneyaResponse;
                })();
            });
    }

    injectCookieCode(){
        this.renderFormContainer()
        this.injectFormInContainer(this.container)

        this.addListeners()
        this.injectPopupButton(this.mutationCallback)
    }
}


const form = new CookieCodeForm(function() {return document.body})
form.injectCookieCode()