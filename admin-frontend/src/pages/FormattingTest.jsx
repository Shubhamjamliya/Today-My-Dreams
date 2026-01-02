import React, { useState } from 'react';
import RichTextEditor from '../components/RichTextEditor';
import BlogContentRenderer from '../components/BlogContentRenderer';

const FormattingTest = () => {
  const [content, setContent] = useState('<p>Select this text and try the formatting options!</p>');

  const testCases = [
    {
      name: 'Bold Text',
      instruction: 'Select text and click Bold (B)',
      expected: 'Text should become <strong>bold</strong>'
    },
    {
      name: 'Italic Text', 
      instruction: 'Select text and click Italic (I)',
      expected: 'Text should become <em>italic</em>'
    },
    {
      name: 'Colored Text',
      instruction: 'Select text and click Palette, then choose a color',
      expected: 'Text should change to the selected color'
    },
    {
      name: 'Font Size',
      instruction: 'Select text and click Type, then choose a size',
      expected: 'Text should change to the selected font size'
    },
    {
      name: 'Bullet List',
      instruction: 'Place cursor on a new line and click List',
      expected: 'Should create a bullet point list'
    },
    {
      name: 'Numbered List',
      instruction: 'Place cursor on a new line and click Numbered List',
      expected: 'Should create a numbered list'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Rich Text Editor - Formatting Test
          </h1>
          <p className="text-gray-600 mb-6">
            Test the formatting options to ensure they work correctly. The selection should be preserved when clicking toolbar buttons.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Editor */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Editor
            </h2>
            <RichTextEditor
              value={content}
              onChange={setContent}
              placeholder="Try selecting text and applying formatting..."
            />
          </div>

          {/* Test Cases */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Test Cases
              </h3>
              <div className="space-y-4">
                {testCases.map((test, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">{test.name}</h4>
                    <p className="text-sm text-gray-600 mb-2">{test.instruction}</p>
                    <p className="text-xs text-blue-600">{test.expected}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Preview */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Preview
              </h3>
              <div className="border border-gray-200 rounded-lg p-4 min-h-[200px]">
                {content ? (
                  <BlogContentRenderer content={content} />
                ) : (
                  <p className="text-gray-400 italic">Content will appear here...</p>
                )}
              </div>
            </div>

            {/* HTML Output */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                HTML Output
              </h3>
              <pre className="bg-gray-100 p-4 rounded-lg text-xs overflow-auto max-h-40">
                {content}
              </pre>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-900 mb-4">
            ✅ How to Test
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-green-800">
            <div>
              <strong>Step 1:</strong> Click in the editor and type some text
            </div>
            <div>
              <strong>Step 2:</strong> Select the text you want to format
            </div>
            <div>
              <strong>Step 3:</strong> Click any formatting button in the toolbar
            </div>
            <div>
              <strong>Step 4:</strong> Verify the text remains selected and formatting is applied
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormattingTest;
