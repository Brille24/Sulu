<?php

/*
 * This file is part of Sulu.
 *
 * (c) Sulu GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 */

namespace Sulu\Component\CustomUrl\Routing\Enhancers;

use Sulu\Component\Content\Compat\Structure;
use Sulu\Component\Content\Compat\Structure\PageBridge;
use Symfony\Cmf\Component\Routing\Enhancer\RouteEnhancerInterface;
use Symfony\Component\HttpFoundation\Request;

/**
 * Redirects to an external page.
 */
class ExternalLinkEnhancer implements RouteEnhancerInterface
{
    public function enhance(array $defaults, Request $request): array
    {
        if (!\array_key_exists('_structure', $defaults)
            || Structure::NODE_TYPE_EXTERNAL_LINK !== $defaults['_structure']->getNodeType()
        ) {
            return $defaults;
        }

        /** @var PageBridge $structure */
        $structure = $defaults['_structure'];

        return \array_merge(
            $defaults,
            [
                '_controller' => 'sulu_website.redirect_controller::redirectAction',
                'url' => $structure->getResourceLocator(),
            ]
        );
    }
}
