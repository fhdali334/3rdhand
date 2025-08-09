"use client"

import React, { isValidElement, cloneElement } from "react"
import { useTranslation } from "@/lib/hooks/use-translation"

// Heuristics to skip short or non-meaningful strings
function shouldSkip(text: string) {
  const trimmed = text.trim()
  if (!trimmed) return true
  if (/^[\d\s\W]*$/.test(trimmed)) return true // numbers/punctuation-only
  if (trimmed.length <= 1) return true
  return false
}

const TRANSLATABLE_PROPS = new Set([
  "aria-label",
  "aria-description",
  "title",
  "placeholder",
  "alt",
  "label",
  "valueLabel",
])

function translateNode(node: React.ReactNode, tr: (text: string) => string): React.ReactNode {
  if (typeof node === "string") {
    if (shouldSkip(node)) return node
    return tr(node)
  }

  if (Array.isArray(node)) {
    return node.map((child, idx) => <React.Fragment key={idx}>{translateNode(child, tr)}</React.Fragment>)
  }

  if (isValidElement(node)) {
    const props: Record<string, any> = { ...node.props }

    // Translate common string props
    for (const key of Object.keys(props)) {
      const value = props[key]
      if (typeof value === "string" && TRANSLATABLE_PROPS.has(key)) {
        props[key] = tr(value)
      }
    }

    // Translate children recursively
    if (props.children) {
      props.children = translateNode(props.children, tr)
    }

    return cloneElement(node, props)
  }

  return node
}

/**
 * AutoTranslator
 * - Recursively walks React children and translates string nodes and common string props at runtime
 * - Uses source-string dictionaries: en.json -> identity, fr/nl.json -> translations
 * - Avoids refactoring each component; minimal flash on client hydration
 */
export function AutoTranslator({ children }: { children: React.ReactNode }) {
  const { tr } = useTranslation()
  return <>{translateNode(children, tr)}</>
}
