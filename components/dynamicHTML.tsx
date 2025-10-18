import Dompurify from "isomorphic-dompurify";
export default function HTML(raw_html: string) {
    const cleanedHTML = Dompurify.sanitize(raw_html)
    return <div dangerouslySetInnerHTML={{__html:cleanedHTML}}></div>
}